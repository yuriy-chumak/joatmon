export const RaceScienceCard = {
    props: ['race', 'description'],
    template: '#race-science-card-template', 
    setup(props) {
        const traits = [
            { id: 0, name: "Energy",        key: 'energy_research_factor',        icon: 'fa-charging-station' },
            { id: 1, name: "Weapons",       key: 'weapons_research_factor',       icon: 'fa-gun' },
            { id: 2, name: "Propulsion",    key: 'propulsion_research_factor',    icon: 'fa-rocket' },
            { id: 3, name: "Construction",  key: 'construction_research_factor',  icon: 'fa-wrench' },
            { id: 4, name: "Electronics",   key: 'electronics_research_factor',   icon: 'fa-network-wired' },
            { id: 5, name: "Biotechnology", key: 'biotechnology_research_factor', icon: 'fa-dna' },
        ];
        return { traits };
    }
};

window.VueApp.component('race-science-card', RaceScienceCard);
