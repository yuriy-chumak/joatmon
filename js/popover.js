import { computePosition, flip, shift, offset } from 'https://esm.sh/@floating-ui/dom@1.6.1';

function setupPopover(trigger, popover) {
    // Функция для обновления позиции
    function update() {
        computePosition(trigger, popover, {
            placement: 'top-start', // предпочитаемое место
            middleware: [offset(10), flip(), shift()],
        }).then(({ x, y }) => {
            Object.assign(popover.style, {
            left: `${x}px`,
            top: `${y}px`,
            });
        });
    }

    // Показ/Скрытие
    function show() {
        popover.style.display = 'block';
        update(); // Обновляем позицию сразу после показа
    }

    function hide() {
        popover.style.display = 'none';
    }

    // // События для КЛИКА (самый надежный способ)
    // trigger.addEventListener('click', () => {
    // if (popover.style.display === 'none') {
    //     show();
    // } else {
    //     hide();
    // }
    // });

    // События для НАВЕДЕНИЯ (ховер)
    trigger.popoverShow = show;
    trigger.popoverHide = hide;

    console.info("EVENTS SETUP")
    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
}
function setupPopovers($el) {
    const popovers = $el.querySelectorAll('.popover');
    popovers.forEach(popover => {
        const trigger = popover.parentElement
        console.log('Найден элемент:', popover, trigger);
        setupPopover(trigger, popover);
    });
}
window.setupPopovers = setupPopovers;

function cleanupPopover(trigger)
{
    trigger.removeEventListener('mouseenter', trigger.popoverShow);
    trigger.removeEventListener('mouseleave', trigger.popoverHide);
}
function cleanupPopovers($el)
{
    const popovers = $el.querySelectorAll('.popover');
    popovers.forEach(popover => {
        const trigger = popover.parentElement
        console.log('Найден элемент:', popover, trigger);
        cleanupPopover(trigger);
    });
}
window.cleanupPopovers = cleanupPopovers;
