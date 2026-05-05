const { ref } = Vue;
export const home = {
    template: '#home-template',

    props: ['username', 'usericon'],

    data() { return {
        // modes
        editRaceMode: false, // режим редактирования расы(false, 'view', 'edit')

        race_templates: {},

        // player data
        race: {}, // races[race_selection]
        race$: {},// race copy for the race viewer
        race_selection: null,
        races: {},

        list_selection: null, // режим показа списка игр
        games: {},
    }},

    mounted() {
        this.$nextTick(() => {
            console.log("next tick");
            Main.UpdateOnlineCounter()
        });

    },

    watch: {
        // user changed
        username(v, old) {
            if (v && v != old) {
                this.UpdateRacesList();
                this.UpdateRaceTemplatesList();
            }
            if (this.list_selection == null)
                this.list_selection = 'attention';
        },

        // race changed
        async race_selection(v, old) {
            if (v == old) return;
            // текущая раса таки изменилась, надо перечитать список игр
            // если, конечно, это не "вообще все игры"
            console.log("race changed");

            // перечитаем список игр расы
            if (v != null) {
                // let selection = this.list_selection;
                this.list_selection = '';
                console.log("update games list for race ", v)
                this.$nextTick(() => {
                    // раз уж кто-то выбрал расу, значит покажем ему все игры этой расы
                    this.list_selection = 'race all';
                });
            }
        },

        // game list mode changed
        async list_selection(v, old) {
            console.log("list_selection: ", old, " -> ", v)
            // if (v == old) return;

            // this.editRaceMode = false;
            if (v == 'all' || v == 'attention' || v == 'finished') {
                this.race = {};
                this.race_selection = null;

                try {
                    const response = await fetch('api/games' + (
                        v == 'attention' ? '?state=1' :
                        v == 'finished'  ? '?state=3' :
                        ''));
                    const data = await response.json();

                    let games =
                        (v == 'attention') ? data.filter((game) => game.state == 1 && game.ready == 0) :
                        (v == 'finished')  ? data.filter((game) => game.state == 3) :
                        data;
                    this.games = games.toIdMap('id');
                }
                catch (error) {
                    console.error(error);
                    this.games = {};
                }
                return;
            }
            if (v == 'new') {
                return;
            }
            if (v == 'race all') {
                console.log("race all")
                try {
                    const response = await fetch(`api/games?race=${this.race.id}`);
                    const data = await response.json();

                    this.games = data.toIdMap('id');
                }
                catch (error) {
                    console.error(error);
                    this.games = {};
                }
                return;
            }
        },
    },
    methods: {
        Update() {
            console.log("UPDATE")
            this.list_selection = this.list_selection;
        },
        async UpdateRaceTemplatesList() {
            console.log("UpdateRaceTemplatesList")
            try {
                const response = await fetch(`api/race/templates`);
                const data = await response.json();

                this.race_templates = data.toIdMap('id');
            }
            catch (error) {
                console.error(error);
                this.race_templates = {};
            }
        },

        async UpdateRacesList() {
            console.log("UpdateRacesList")
            try {
                const response = await fetch(`api/races`);
                const data = await response.json();

                this.races = data.toIdMap('id');

                // DEMO:
                // console.log("DEMO: select first race viewer/editor")
                // await this.SelectRace(Object.keys(this.races)[0]);
                // this.EditSelectedRace();
            }
            catch (error) {
                console.error(error);
                this.races = {};
            }
        },
        async Open() {
            await this.UpdateRacesList();
            this.list_selection = 'attention';
        },
        async SelectRace(id) {
            console.log(`SelectRace(${id})`)
            this.race = this.races[id];
            // this.editRaceMode = null; // отменим любое редактирование

            // get full race info
            try {
                const response = await fetch(`api/races/${this.race.id}`);
                const data = await response.json();
                console.log(`SelectRace(${id}) = `, data)
                // обновим описание расы
                this.race = {...this.race, ...data};
            }
            catch (error) {
                console.error(error);
            }
            // TODO: мне нужны deep copy, а не как сейчас:
            this.race$ = { ...this.race };
            console.log(JSON.stringify(this.race$))
            this.race_selection = id; // обновлять после race! на нем триггер
        },
        async DeleteRace(index) {
            console.log(`DeleteRace(${index})`);
        },
        EditSelectedRace() {
            console.log("EditSelectedRace()")
            this.editRaceMode = this.race.readonly ? 'view' : 'edit';
        },
    },
};
