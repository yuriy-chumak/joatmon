export const RaceHabitatCard = {
    props: ['race', 'description'],
    template: '#race-habitat-card-template', 
    setup(props) {
        const doSomething = () => {
            alert(`Нажата карточка: ${props.title}`);
        };
        return { doSomething };
    }
};

window.VueApp.component('race-habitat-card', RaceHabitatCard);
