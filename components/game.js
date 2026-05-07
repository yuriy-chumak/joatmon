const { ref } = Vue;
export const game = {
    template: '#game-template',
    data() { return {
        race_id: null,
        game_ready: null, // состояние ready игрока, получаемое через /ready api

        // информация о игре
        game: {},  // game.state = состояние игры (обновляется через sse нотификатор)
        game_id: null,

        planet: {},
        planet$: {}, // веменное поле для апдейта реального с сервера
        planets: {},
    }},
    setup(props) {
        return { };
    },
    mounted() {
        this.draw = SVG().addTo('#svg');
        this.triangle = null;
    },
    beforeUnmount() {
        console.log("GAME unmount")
        if (this.draw) {
             this.draw.clear();
             this.draw.remove();
        }
        if (this.eventSource) this.eventSource.close();
    },
    computed: {
        game_state: function() {
            return this.game.state == 2 ? 2 : this.game_ready;
        },

        //- карточки с инфой о планете показываем только если планету выбрали на карте
        //- todo: не показывать, если выбран космический корабль (тогда показывать его)
        show_planet_cards: function() {
            return ! this.planet.isEmpty();
        }
    },
    watch: {
        async game_id(v, old) {
            console.log("пора обновить игру")
            await this.UpdateGameInfo();
        },
        async game_ready(v, old) {
            console.log("open: ", old, "->", v)
            if (v == old) return;

            // если мы перешли в режим "готов планировать год"
            // то все надо перечитать по новой (мир стал неактуальным)
            if (v == 0) {
                await this.UpdateGameInfo();
                await this.UpdatePlanetsList();
            }
        },

        // выбор планеты изменился
        async planet(planet, old) {
            // 1. нарисуем новую поверхность
            generateSurface(planet.surface);
        },
        async planet$(planet, old) {
            // 1. подсветим треугольником планету
            let D = isMobile ? 1.5 : 1;
            if (this.triangle != undefined)
                this.triangle.remove();

            let x = planet.x;
            let y = planet.y;
            this.triangle = this.draw.polygon([
                [0, 0],   [ 2*D,5*D],
                [0, 3*D], [-2*D,5*D],
                [0, 0]
            ])
            .move(x-2*D, y+3*D).fill('none')
            .stroke({ color: 'yellow', width: D });

            // 2. обновим ее данные с сервера, если еще не забирали
            let race_id = this.race_id;
            console.log("planet.year = ", planet.year)
            if (!planet.year) {
                const response = await fetch(`api/games/${this.game_id}/planets/${planet.id}?race=${race_id}`);
                const data = await response.json();
                console.log(data)
                // обновим данные о планете
                Object.assign(planet, data);
            }

            // 3. отправим актуальные данные на отображение и обработку
            this.planet = planet;
        },
        planets(planets, old) {
            console.log("this.planets обновился")
            // удалим с карты все планеты
            this.draw.find('.planet').each(function() {
                this.remove();
            });

            // нарисуем на фоне планетарные сканеры (сканируемую территорию)
            console.log("ищем сканеры");
            for (let pid in planets) {
                let planet = planets[pid];
                if (!planet.scanner)
                    continue;
                console.log("planet.scanner: ", planet.scanner);
                this.draw.circle(2 * planet.scanner.radius).fill('#77227755')
                .center(planet.x, planet.y)
            }

            // и нарисуем новые
            var radius = isMobile ? 2 : 1;
            for (let pid in planets) {
                let planet = planets[pid];

                // if normal view
                // TODO: изменять радиус кружочка в зависимости от выбранных параметров отображения (население, ценность, ...)
                this.draw.circle(2 * radius).fill(
                    planet.owner == this.race_id ? '#00ee00' : // принадлежит нам
                    planet.owner != false ? '#ee0000' : // чужая
                    '#cbcbcb')
                .center(planet.x, planet.y)
                .addClass('planet');
            }


            // список планет обновился, а ни одна планета еще не выбрана
            // значит найдем ~~первую~~ лучшую из наших
            let planet_id = this.planet.id; // если уже была выбрана
            if (planet_id == undefined) {
                planet_id = Object.keys(this.planets)[0]; // первая попавшаяся планета
                let population = 0;
                for (let id in planets) {
                    const planet = planets[id];
                    if (planet.owner == this.race_id) {
                        if (planet.population > population)
                            planet_id = planet.id;
                    }
                }
            }
            if (planet_id !== null)
                this.planet$ = this.planets[planet_id];
        },
    },
    methods: {
        async Open(race_id, game_id) {
            this.race_id = race_id;
            this.game_id = game_id;

            console.log("creating eventSource")
            this.eventSource = new EventSource(`api/games/${this.game_id}/events`);

            this.eventSource.onmessage = (message) => {
                const data = JSON.parse(message.data);
                console.info('Получено сообщение:', data);
                console.info('event: ', data.event)
                if (data.event == "game.state") { // игра обновила свое состояние
                    console.log(`new game state. ${this.game.state} -> ${data.state}`)
                    // assert (this.game.id == data.game_id)

                    // если игра из 2 состояния перешла в 1 - значит был сделан ход и можно
                    // продолжать играть
                    if (this.game.state == 2 && data.state == 1) {
                        this.game_ready = 0;
                    }
                    
                    this.game.state = data.state;
                }
            };
            this.eventSource.onerror = (error) => {
                // TODO: обновить количество игроков онлайн
                console.error('EventSource failed:', error);
            }

            // первым делом сообщаем серверу, что мы собираемся менять приказы (мы еще "не готовы")
            await this.apiReady(0);

            setTimeout(() => Main.UpdateOnlineCounter(), 1000); // ну и почему бы не обновить табличку

        },

        async UpdateGameInfo() {
            const response = await fetch(`api/games/${this.game_id}`);
            const data = await response.json();

            this.game = data;
            this.$emit('set-title', `${data.name} - ${data.year}`)
        },

        async UpdatePlanetsList() {
            let race_id = this.race_id;
            let game_id = this.game_id;

            // ПЛАНЕТЫ
            // все планеты карты, полнота информации зависит от расы которая смотрит
            const response = await fetch(`api/games/${game_id}/planets?race=${race_id}`);
            const data = await response.json();

            // список планет по их индексам, а не просто 0..N
            // Object.assign
            this.planets = data.toIdMap('id'); // это должно автоматически перерисовать карту
        },

        // TODO: если планета уже выбрана, то вторым кликом
        //       открывать меню с выбором кораблей, находящихся на орбите
        async svgClicked() {
            let rect = svg.getBoundingClientRect();
            let x = svg.viewBox.baseVal.width * ((arguments[0].clientX - rect.left) / rect.width);
            let y = svg.viewBox.baseVal.height * ((arguments[0].clientY - rect.top) / rect.height);
            console.log(x, " ", y)

            let dist = 999999;
            let focus;
            for (let i in this.planets) {
                let p = this.planets[i];
                let d = Math.abs(p.x - x) + Math.abs(p.y - y);
                if (d < dist) {
                    dist = d;
                    focus = p;
                }
            }

            this.planet$ = this.planets[focus.id];
        },

        async Ready(andExit) {
            console.log(`Ready(${andExit})`)

            // сообщим, что мы сделали ход
            await this.apiReady(1);

            // выходим
            if (andExit) {
                this.$emit('home');
                return;
            }
            // ну раз не выходим, значит ждем остальных
        },
        async StopWaiting(andExit) {
            console.log(`StopWaiting(${andExit})`)
            if (andExit)
                return this.$emit('home');

            // мы передумали, сообщим об этом серверу
            await this.apiReady(0);
        },
        async getReady() {
            const response = await fetch(`api/games/${this.game_id}/races/${this.race_id}/ready`);
            const ready = await response.json();
            console.log(`getReady() = ${ready}`);
            this.game_ready = ready;
        },

        async apiReady(v) {
            const response = await POST(`api/games/${this.game_id}/races/${this.race_id}/ready`, v);
            const ready = await response.json();
            console.log(`apiReady(${v}) = ${ready}`);
            this.game_ready = ready;
            return ready;
        },

        async SelectNextPlanet() {
            console.log("SelectNextPlanet")
            const nextPlanets = Object.keys(this.planets).filter((id) => id > this.planet.id);
            for (const id of nextPlanets) {
                let planet = this.planets[id];
                if (planet.owner == this.race_id) {
                    this.planet$ = planet; return;
                }
            }
            const prevPlanets = Object.keys(this.planets).filter((id) => id < this.planet.id);
            for (const id of prevPlanets) {
                let planet = this.planets[id];
                if (planet.owner == this.race_id) {
                    this.planet$ = planet; return;
                }
            }
        },
        async SelectPrevPlanet() {
            console.log("SelectPrevPlanet")
            const prevPlanets = Object.keys(this.planets).filter((id) => id < this.planet.id);
            for (const id of prevPlanets.reverse()) {
                let planet = this.planets[id];
                if (planet.owner == this.race_id) {
                    this.planet$ = planet; return;
                }
            }
            const nextPlanets = Object.keys(this.planets).filter((id) => id > this.planet.id);
            for (const id of nextPlanets.reverse()) {
                let planet = this.planets[id];
                if (planet.owner == this.race_id) {
                    this.planet$ = planet; return;
                }
            }

            // const prevPlanets = this.planets.filter((planet) => planet.id < this.planet.id);
            // for (let id in prevPlanets) {
            //     let planet = prevPlanets[id];
            //     if (planet.owner == this.race_id) {
            //         this.planet = planet; return;
            //     }
            // }
        },
    },
}