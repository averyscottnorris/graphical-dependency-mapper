import { h, Component } from 'preact';
import { Controller } from '../controller';
import Cytoscape from 'cytoscape';
import { layout, style } from '../cy-conf';
import CytoscapeComponent from './cytoscape';
import { isDev } from '../env';
import { NodeInfo } from './node-info';
import { Menu } from './menu';
import NetworkGenerator from './networkgenerator';
import fcose from 'cytoscape-fcose';
import cytoscape from 'cytoscape';
cytoscape.use(fcose);

class AppComponent extends Component {
    constructor(props) {
        super(props);

        const elements = [];

        const cy = new Cytoscape({
            elements,
            style,
            layout: { name: 'preset' },
            selectionType: 'single',
            boxSelectionEnabled: true,
            grabbable: true,
            minZoom: .05
        });


        // cy.nodes().panify().ungrabify();

        const controller = new Controller({ cy });
        const bus = controller.bus;

        if (isDev) {
            window.cy = cy;
            window.controller = controller;
        }

        this.state = { controller, cy };

        bus.on('showInfo', this.onShowInfo = (node => {
            this.setState({ infoNode: node });
        }));

        bus.on('hideInfo', this.onHideInfo = (() => {
            this.setState({ infoNode: null });
        }));
    }

    componentDidMount() {
        const nGen = new NetworkGenerator();
        nGen.generateElements().then((elements) => {
            this.state.cy.add(elements);
            this.state.controller.updateNodes();
            this.state.cy.layout(layout.fcose).run();
        });
    }

    componentWillUnmount() {
        const bus = this.state.controller.bus;

        bus.removeListener('showInfo', this.onShowInfo);
        bus.removeListener('hideInfo', this.onHideInfo);
    }

    render() {
        const { cy, controller, infoNode } = this.state;

        document.getElementById('loader').setAttribute('display', 'hidden');

        return h('div', { class: 'app' }, [
            h(CytoscapeComponent, { cy, controller }),

            infoNode ? (
                h('div', { class: 'app-node-info' }, [
                    h(NodeInfo, { node: infoNode })
                ])
            ) : null,

            h(Menu, { controller })
        ]);
    }
}

export default AppComponent;
export { AppComponent };