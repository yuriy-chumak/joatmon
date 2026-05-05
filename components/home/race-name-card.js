import { generateName } from '../../js/race-name-generator.js';
export const RaceNameCard = {
    props: [
        'race', 'templates',
    ],
    template: '#race-name-card-template',
    setup(props) {
        const GenerateRandomName = () => {
            props.race.name = generateName();
        };

        return { GenerateRandomName };
    }
};

window.VueApp.component('race-name-card', RaceNameCard);
