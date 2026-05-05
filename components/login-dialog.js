const { ref } = Vue;
window.onVueReady((app) => app.component('login-dialog', {
    template: '#login-dialog-template', 
    props: ['title', 'description', 'open'],
    setup(props) { // temp
        // local variables
        const signingin = ref(''); // флажок обработки запроса на логин, todo: move to data() { return { ... }}

        const login = ref('');
        const password = ref('');

        // methods
        const doLogin = async () => {
            signingin.value = true;

            try {
                const response = await POST(`api/login`, {
                    login: login.value,
                    password: password.value});
                const data = await response.json();
                console.log(data);

                signingin.value = false;
                window.location.reload();
            }
            catch (error) {
                console.error(error);
                signingin.value = false;
            }
        };

        const doLoginGoogle = async () => {
            // signingin.value = true;
            try {
                // let's generate some unique session id
                let $session =
                    btoa(`${Math.random()}/${Math.random()}/${new Date().getTime()}`);

                // start google login
                window.open(`https://accounts.google.com/o/oauth2/auth?` +
                            `redirect_uri=${encodeURIComponent(location + "api/login")}&` +
                            `response_type=code&` +
                            `client_id=${$clientId}&` +
                            `state=${$session}&` +
                            `scope=${encodeURIComponent("https://www.googleapis.com/auth/userinfo.email")}`);

                // and now, periodically query back for access
                let timeout = 1000;
                function chunk() {
                    // do we logged in?
                    fetch("api/whoami", {
                        method: 'GET',
                    })
                    .then(response => {
                        console.log(response);
                        switch (response.status) {
                        case 200:
                            // data.Close();
                            // window.location.reload();
                            // signingin.value = false;
                            break;
                        case 401:
                            timeout += Math.trunc(timeout * 0.10); // test the server slower and slower
                            setTimeout(chunk, timeout);
                            break;
                        }
                    })
                    .catch((status) => {
                        console.error(status);
                    });
                };
                // setTimeout(chunk, 5000); // initially wait for 5 seconds
            }
            catch (error) {
                console.error(error);
            }
        };
        return { signingin, login, password, doLogin, doLoginGoogle };
    },
    watch: {
        open(v) {
            console.log("Opened!")
            if (v) {
                this.signingin = false;
            }
            else {
                // $(this.$el).modal('hide');
            }
        }
    }
}));
