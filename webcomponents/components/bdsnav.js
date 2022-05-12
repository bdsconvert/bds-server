export class BdsNav extends HTMLElement {
    constructor() {
        super();
        this.navItems = [
            {name:'Home', icon:'', show: true},
            {name:'Contact', icon:'', show: true},
            {name:'Terms', icon:'', show: true},
            {name:'SignOn', icon:'', show: true},
            {name:'SignOut', icon:'', show: true}
        ];
    }
    connectedCallback() {
        let script = `
            <style>
                hdr {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    justify-content: space-between;
                    border: 1px solid;
                    
                }
                nav {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    justify-content: right;
                }
                a {
                    padding: 4px;
                }
            </style>
        `
        let logo = `<logo>BookDataSolutions</logo>`;
        let nav = '<nav>';
        this.navItems.forEach(item => {
            nav += item.show ? `<a href="#">${item.name}</a>` : '';
        });
        nav += '</nav>';
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = `${script}<hdr>${logo}${nav}</hdr>`;
    }
}
window.customElements.define("bds-nav", BdsNav);