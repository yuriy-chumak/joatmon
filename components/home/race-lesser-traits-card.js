export const RaceLesserTraitsCard = {
    props: ['race', 'description'],
    template: '#race-lesser-traits-card-template', 
    setup(props) {
        return { };
    },

    computed: {
        traits: function() {
            return [
                { id:     1, name: $t('IFE') },
                { id:     2, name: $t('NRSE') },
                { id:     4, name: $t('TT') },
                { id:     8, name: $t('CE') },
                { id:    16, name: $t('ARM') },
                { id:    32, name: $t('OBRM') },
                { id:    64, name: $t('IS') },
                { id:   128, name: $t('NAS') },
                { id:   256, name: $t('GR') },
                { id:   512, name: $t('LSP') },
                { id:  1024, name: $t('UR') },
                { id:  2048, name: $t('BET') },
                { id:  4096, name: $t('MA') },
                { id:  8192, name: $t('RS') },
                { id: 16384, name: $t('CF') },
            ];
        },
    }
};

window.VueApp.component('race-lesser-traits-card', RaceLesserTraitsCard);
