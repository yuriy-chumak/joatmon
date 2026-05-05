export const RaceEconomyCard = {
    props: ['race', 'description'],
    template: '#race-economy-card-template', 
    setup(props) {
        const doSomething = () => {
            alert(`Нажата карточка: ${props.title}`);
        };
        return { doSomething };
    }
};

window.VueApp.component('race-economy-card', RaceEconomyCard);
