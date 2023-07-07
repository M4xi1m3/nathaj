import { TFunction } from 'i18next';
import { ActionElement } from './ActionMenu';

export const ExampleSubMenu: (loadString: (data: string) => void, t: TFunction) => ActionElement[] = (
    loadString,
    t
) => [
    {
        name: t('menu.file.example.simple.title'),
        elements: [
            {
                name: t('menu.file.example.simple.twohosts'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"h1","interface":"eth0"}}],"x":-50,"y":0},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"h0","interface":"eth0"}}],"x":50,"y":0}]}'
                    );
                },
            },
            {
                name: t('menu.file.example.simple.hub'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"hub0","interface":"eth0"}}],"x":-75,"y":0},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"hub0","interface":"eth1"}}],"x":0,"y":-75},{"type":"hub","name":"hub0","interfaces":[{"name":"eth0","mac":"02:00:00:01:00:00","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth1","mac":"02:00:00:01:00:01","connected_to":{"device":"h1","interface":"eth0"}},{"name":"eth2","mac":"02:00:00:01:00:02","connected_to":{"device":"h2","interface":"eth0"}},{"name":"eth3","mac":"02:00:00:01:00:03","connected_to":{"device":"h3","interface":"eth0"}}],"x":0,"y":0},{"type":"host","name":"h2","interfaces":[{"name":"eth0","mac":"02:00:00:00:02:00","connected_to":{"device":"hub0","interface":"eth2"}}],"x":75,"y":0},{"type":"host","name":"h3","interfaces":[{"name":"eth0","mac":"02:00:00:00:03:00","connected_to":{"device":"hub0","interface":"eth3"}}],"x":0,"y":75}]}'
                    );
                },
            },
            {
                name: t('menu.file.example.simple.switch'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"sw0","interface":"eth0"}}],"x":-75,"y":0},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"sw0","interface":"eth1"}}],"x":0,"y":-75},{"type":"host","name":"h2","interfaces":[{"name":"eth0","mac":"02:00:00:00:02:00","connected_to":{"device":"sw0","interface":"eth2"}}],"x":75,"y":0},{"type":"host","name":"h3","interfaces":[{"name":"eth0","mac":"02:00:00:00:03:00","connected_to":{"device":"sw0","interface":"eth3"}}],"x":0,"y":75},{"type":"switch","name":"sw0","interfaces":[{"name":"eth0","mac":"02:00:00:02:00:00","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth1","mac":"02:00:00:02:00:01","connected_to":{"device":"h1","interface":"eth0"}},{"name":"eth2","mac":"02:00:00:02:00:02","connected_to":{"device":"h2","interface":"eth0"}},{"name":"eth3","mac":"02:00:00:02:00:03","connected_to":{"device":"h3","interface":"eth0"}}],"x":0,"y":0}]}'
                    );
                },
            },
            {
                name: t('menu.file.example.simple.loop'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"switch","name":"sw0","interfaces":[{"name":"eth0","mac":"02:00:00:02:00:00","connected_to":{"device":"sw2","interface":"eth0"}},{"name":"eth1","mac":"02:00:00:02:00:01","connected_to":{"device":"sw1","interface":"eth1"}},{"name":"eth2","mac":"02:00:00:02:00:02","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth3","mac":"02:00:00:02:00:03"}],"x":-75,"y":0},{"type":"switch","name":"sw1","interfaces":[{"name":"eth0","mac":"02:00:00:02:01:00","connected_to":{"device":"sw2","interface":"eth1"}},{"name":"eth1","mac":"02:00:00:02:01:01","connected_to":{"device":"sw0","interface":"eth1"}},{"name":"eth2","mac":"02:00:00:02:01:02"},{"name":"eth3","mac":"02:00:00:02:01:03"}],"x":0,"y":50},{"type":"switch","name":"sw2","interfaces":[{"name":"eth0","mac":"02:00:00:02:02:00","connected_to":{"device":"sw0","interface":"eth0"}},{"name":"eth1","mac":"02:00:00:02:02:01","connected_to":{"device":"sw1","interface":"eth0"}},{"name":"eth2","mac":"02:00:00:02:02:02","connected_to":{"device":"h1","interface":"eth0"}},{"name":"eth3","mac":"02:00:00:02:02:03"}],"x":0,"y":-50},{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"sw0","interface":"eth2"}}],"x":-125,"y":0},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"sw2","interface":"eth2"}}],"x":75,"y":0}]}'
                    );
                },
            },
        ],
    },
    {
        name: t('menu.file.example.stp.title'),
        elements: [
            {
                name: t('menu.file.example.stp.triangle'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"stp-switch","priority":32768,"name":"sw0","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:00:00","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:00:01","connected_to":{"device":"sw2","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:00:02","connected_to":{"device":"sw1","interface":"eth1"}}],"x":-50,"y":25},{"type":"stp-switch","priority":32768,"name":"sw1","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:01:00","connected_to":{"device":"sw2","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:01:01","connected_to":{"device":"sw0","interface":"eth2"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:01:02","connected_to":{"device":"h1","interface":"eth0"}}],"x":50,"y":25},{"type":"stp-switch","priority":32768,"name":"sw2","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:02:00","connected_to":{"device":"sw0","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:02:01","connected_to":{"device":"sw1","interface":"eth0"}}],"x":0,"y":-50},{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"sw0","interface":"eth0"}}],"x":-100,"y":25},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"sw1","interface":"eth2"}}],"x":100,"y":25}]}'
                    );
                },
            },
            {
                name: t('menu.file.example.stp.complex'),
                action: () => {
                    loadString(
                        '{"devices":[{"type":"stp-switch","priority":32768,"name":"sw0","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:00:00","connected_to":{"device":"sw1","interface":"eth0"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:00:01","connected_to":{"device":"sw3","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:00:02","connected_to":{"device":"h4","interface":"eth0"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:00:03"}],"x":0,"y":-150},{"type":"stp-switch","priority":32768,"name":"sw1","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:01:00","connected_to":{"device":"sw0","interface":"eth0"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:01:01","connected_to":{"device":"sw2","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:01:02","connected_to":{"device":"sw5","interface":"eth0"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:01:03"}],"x":-75,"y":-100},{"type":"stp-switch","priority":32768,"name":"sw2","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:02:00","connected_to":{"device":"sw1","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:02:01","connected_to":{"device":"sw3","interface":"eth2"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:02:02","connected_to":{"device":"hub0","interface":"eth1"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:02:03"}],"x":0,"y":-50},{"type":"stp-switch","priority":32768,"name":"sw3","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:03:00","connected_to":{"device":"sw0","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:03:01","connected_to":{"device":"sw4","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:03:02","connected_to":{"device":"sw2","interface":"eth1"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:03:03"}],"x":75,"y":-100},{"type":"stp-switch","priority":32768,"name":"sw4","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:04:00","connected_to":{"device":"sw3","interface":"eth1"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:04:01","connected_to":{"device":"h3","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:04:02","connected_to":{"device":"sw7","interface":"eth2"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:04:03"}],"x":150,"y":-50},{"type":"stp-switch","priority":32768,"name":"sw5","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:05:00","connected_to":{"device":"sw1","interface":"eth2"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:05:01","connected_to":{"device":"h0","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:05:02","connected_to":{"device":"hub0","interface":"eth0"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:05:03"}],"x":-150,"y":-50},{"type":"stp-switch","priority":32768,"name":"sw7","interfaces":[{"name":"eth0","disabled":false,"cost":1,"mac":"02:00:00:02:07:00","connected_to":{"device":"hub0","interface":"eth3"}},{"name":"eth1","disabled":false,"cost":1,"mac":"02:00:00:02:07:01","connected_to":{"device":"h2","interface":"eth0"}},{"name":"eth2","disabled":false,"cost":1,"mac":"02:00:00:02:07:02","connected_to":{"device":"sw4","interface":"eth2"}},{"name":"eth3","disabled":false,"cost":1,"mac":"02:00:00:02:07:03"}],"x":0,"y":50},{"type":"host","name":"h0","interfaces":[{"name":"eth0","mac":"02:00:00:00:00:00","connected_to":{"device":"sw5","interface":"eth1"}}],"x":-225,"y":0},{"type":"host","name":"h1","interfaces":[{"name":"eth0","mac":"02:00:00:00:01:00","connected_to":{"device":"hub0","interface":"eth2"}}],"x":-150,"y":50},{"type":"host","name":"h2","interfaces":[{"name":"eth0","mac":"02:00:00:00:02:00","connected_to":{"device":"sw7","interface":"eth1"}}],"x":-75,"y":100},{"type":"host","name":"h3","interfaces":[{"name":"eth0","mac":"02:00:00:00:03:00","connected_to":{"device":"sw4","interface":"eth1"}}],"x":150,"y":25},{"type":"host","name":"h4","interfaces":[{"name":"eth0","mac":"02:00:00:00:04:00","connected_to":{"device":"sw0","interface":"eth2"}}],"x":75,"y":-150},{"type":"hub","name":"hub0","interfaces":[{"name":"eth0","mac":"02:00:00:01:00:00","connected_to":{"device":"sw5","interface":"eth2"}},{"name":"eth1","mac":"02:00:00:01:00:01","connected_to":{"device":"sw2","interface":"eth2"}},{"name":"eth2","mac":"02:00:00:01:00:02","connected_to":{"device":"h1","interface":"eth0"}},{"name":"eth3","mac":"02:00:00:01:00:03","connected_to":{"device":"sw7","interface":"eth0"}}],"x":-75,"y":0}]}'
                    );
                },
            },
        ],
    },
];
