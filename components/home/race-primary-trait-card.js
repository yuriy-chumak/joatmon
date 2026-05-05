export const RacePrimaryTraitCard = {
    props: ['race', 'description'],
    template: '#race-primary-trait-card-template', 
    setup(props) {
        const traits = [
            { id: 0, name: "Hyper-Expansion" },
            { id: 5, name: "Space Demolition" },
            { id: 1, name: "Super-Stealth" },
            { id: 6, name: "Packet Physics" },
            { id: 2, name: "War Monger" },
            { id: 7, name: "Inter-stellar Traveler" },
            { id: 3, name: "Claim Adjuster" },
            { id: 8, name: "Alternate Reality" },
            { id: 4, name: "Inner-Strength" },
            { id: 9, name: "Jack of All Trades" },
        ];
        return { traits };
    }
};

window.VueApp.component('race-primary-trait-card', RacePrimaryTraitCard);
