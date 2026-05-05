// Main занимается авторизацией и переключением экранов home/game
import { HttpError } from './js/HttpError.js';

// эти две компоненты (home и game окна) грузим синхронно
import { home } from './components/home.js';
import { game } from './components/game.js';

const Title = "JoATMoN";

const { createApp } = Vue;
window.Main = async () => {
    const app = createApp({
        components: { home, game },
        data() { return {
            title: Title,
            serverStatus: null,
            playersOnline: 42,

            // user info
            username: undefined,
            usericon: undefined,

            // dialogs
            loginDialog: false, // показать диалог логина
        }},
        setup(props) {
            // какое окно показывать:
            const homeScreen = ref('home');

            return { homeScreen };
        },
        mounted() {
            
        },
        computed: {
        },

        methods: {
            navbarClicked() {
                console.log('navbarClicked')
                $(".navbar-burger").toggleClass("is-active");
                $(".navbar-menu").toggleClass("is-active");
            },
            titleClicked() {
                console.log("titleClicked")
            },

            HandleNetworkError(error) {
                console.log(this);
                console.log(this.serverStatus);
            },
            // обновить картинку "онлайн"
            async UpdateOnlineCounter() {
                console.log("this:", this);
                console.log(this.playersOnline);
                try {
                    const response = await fetch(`api/stats/online`);
                    const data = await response.json();
                    this.playersOnline = data;
                }
                catch (error) {
                    console.error(error);
                    // тут бы стоило поправить табличку "server online"
                }
            },

            async checkServer() {
                this.serverStatus = false;
                try {
                    const response = await fetch(`api/whoami`);
                    if (response.status != 200)
                        throw new HttpError(response);
                    const data = await response.json();

                    this.serverStatus = 'online';
                    this.loginDialog = false;

                    this.username = data.name; // на username навешен триггер
                    this.usericon = data.icon;
                }
                catch (error) {
                    console.error(error);
                    if (error instanceof SyntaxError) {
                        this.serverStatus = 'broken';
                    }
                    else
                    if (error instanceof HttpError) {
                        switch (error.status) {
                            case 401:
                                this.serverStatus = 'online';
                                this.username = null;
                                this.loginDialog = true; // вызываем логин
                                break;
                            case 403:
                                this.serverStatus = 'banned';
                                break;
                            default:
                                this.serverStatus = 'broken';
                                break;
                        }
                    }
                    else {
                        this.serverStatus = 'broken';
                    }
                }
            },

            async Logout() {
                console.log("Logout");
                this.races = [];
                try {
                    const response = await fetch(`api/logout`);
                    this.checkServer();
                }
                catch (error) {
                    console.error(error);
                }
            },

            async LoginSuccessful() {
                console.log("login ok");
                this.checkServer();
            },

            async Home() {
                console.log("Home")
                this.title = Title;
                this.homeScreen = 'home';
                await this.$nextTick(); // подождем пока скрин создастся
                if (this.$refs.home)
                    this.$refs.home.Open();
            },
            async PlayGame(game) {
                const race_id = game.race;
                const game_id = game.id;

                this.title = game.name;
                this.homeScreen = 'game';
                await this.$nextTick(); // подождем пока скрин создастся
                if (this.$refs.game)
                    this.$refs.game.Open(race_id, game_id);
            },
            async SetTitle(title) {
                console.log("Set-Title")
                this.title = title;
            },

        },
        async mounted() {
            // пингуем сервер, проверяем свой логи
            await this.checkServer();

            // покажем онлайн
            {
                const response = await fetch(`api/stats/online`);
                const data = await response.json();
                this.playersOnline = data;
            }

            // DEMO:
            console.log("DEMO: play first player demo game")
            const response = await fetch('api/games');
            const data = (await response.json()).toIdMap();
            if (data[1])
                this.PlayGame(data[1]);
        }
    });

    // набор глобальных функций форматирования цифр и текста
    app.config.globalProperties.$FN = (num) =>
        (num === null || num === undefined || num === '' || isNaN(num))
            ? "??" // двойной вопрос говорит "не знаю, но так и должно быть"
                                        // разделитель изменился на пробелы
            : Number(num).toLocaleString('fr-CH').replace(/\s/g, "'");

    window.VueApp = app;
    const event = new CustomEvent('vue-app-ready', { detail: window.VueApp });
    window.dispatchEvent(event);    

    //- подключаем все компоненты
    try {
        await import('./components/home/race-name-card.js');
        await import('./components/home/race-primary-trait-card.js');
        await import('./components/home/race-lesser-traits-card.js');
        await import('./components/home/race-habitat-card.js');
        await import('./components/home/race-economy-card.js');
        await import('./components/home/race-science-card.js');

        // Теперь $q доступен в любом шаблоне (включая Pug)
        app.config.globalProperties.$t = window.$t;
        // А это пригодится для кнопок переключения языка
        app.config.globalProperties.$setLocale = $setLocale;

        //- запускаемся и перезапишем Main
        window.Main = app.mount('#main');
    } catch (err) {
        console.error("Ошибка загрузки компонента:", err);
    }
};

export { };
