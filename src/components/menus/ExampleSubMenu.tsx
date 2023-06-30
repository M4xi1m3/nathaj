import { ActionElement } from './ActionMenu';

export const ExampleSubMenu: (loadString: (data: string) => void) => ActionElement[] = (loadString) => [
    {
        name: 'STP',
        elements: [
            {
                name: 'Triangle',
                action: () =>
                    loadString(
                        '{"devices":[{"type":"stp-switch","priority":32768,"name":"sw0","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:00:00:00","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:00:00:01","connected_to":{"device":"sw2","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:00:00:02","connected_to":{"device":"sw1","interface":"eth1"}}],"x":-50,"y":25},{"type":"stp-switch","priority":32768,"name":"sw1","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:00:01:00","connected_to":{"device":"sw2","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:00:01:01","connected_to":{"device":"sw0","interface":"eth2"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:00:01:02","connected_to":{"device":"h1","interface":"eth0"}}],"x":50,"y":25},{"type":"stp-switch","priority":32768,"name":"sw2","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:00:02:00","connected_to":{"device":"sw0","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:00:02:01","connected_to":{"device":"sw1","interface":"eth0"}}],"x":0,"y":-50},{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:01:00:00","connected_to":{"device":"sw0","interface":"eth0"}}],"x":-100,"y":25},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:01:01:00","connected_to":{"device":"sw1","interface":"eth2"}}],"x":100,"y":25}]}'
                    ),
            },
        ],
    },
];
