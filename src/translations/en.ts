export const en = {
    translation: {
        app: {
            name: 'Näthaj',
            namever: '$t(app.name) {{version}}',
            version: 'Version {{version}}',
            description: 'A web-based network simulator written in TypeScript using the React library',
        },
        panel: {
            network: {
                title: 'Network',
                action: {
                    removedev: 'Remove device',
                    addlink: 'Add link',
                    removelink: 'Remove link',
                    autolayout: 'Automatic layout',
                    centerview: 'Center view',
                    labels: 'Toggle labels',
                    snap: 'Toggle snap to grid',
                    grid: 'Toggle grid',
                },
                snack: {
                    linkadded: 'Link added',
                    linkremoved: 'Link removed',
                    deviceremoved: 'Device {{name}} removed',
                },
                render: {
                    offset: 'Offset: {{x}};{{y}}',
                    scale: 'Scale: {{scale}}',
                    time: 'Time: {{time}}',
                },
            },
            properties: {
                title: 'Properties',
                titleof: 'Properties of {{name}}',
                nodevice: 'No device selected',
                action: {
                    addintf: 'Add interface',
                    delete: 'Delete',
                },
                host: {
                    action: {
                        llctest: 'Send LLC TEST',
                    },
                    snack: {
                        llcsent: 'LLC TEST Sent',
                        llcrunning: 'LLC TEST Already running',
                        llcsuccess: 'LLC TEST Success',
                        llctimeout: 'LLC TEST Timed out',
                    },
                },
                stpswitch: {
                    priority: 'Priority',
                    role: 'Role',
                    roles: {
                        Root: 'Root',
                        Designated: 'Designated',
                        Blocking: 'Blocking',
                        Disabled: 'Disabled',
                    },
                    state: 'State',
                    states: {
                        Blocking: 'Blocking',
                        Listening: 'Listening',
                        Learning: 'Learning',
                        Forwarding: 'Forwarding',
                        Disabled: 'Disabled',
                    },
                    cost: 'Cost',
                    action: {
                        enable: 'Enable',
                        disable: 'Disable',
                    },
                },
                macaddresstable: {
                    title: 'MAC Address Table',
                    mac: 'MAC',
                    interface: 'Interface',
                    empty: 'Empty',
                },
                mac: {
                    title: 'MAC Address',
                },
                pos: {
                    x: 'X',
                    y: 'Y',
                },
                type: 'Type',
                name: 'Name',
                interface: 'Interface {{name}}',
                connectedto: 'Connected to',
                notconnected: 'Not connected',
                save: 'Save',
                cancel: 'Cancel',
            },
            analyzer: {
                title: 'Packet analyzer',
                nopackets: 'No packets to display',
                columns: {
                    id: '#',
                    time: 'Time',
                    origin: 'Origin',
                    direction: 'Direction',
                    source: 'Source',
                    destination: 'Destination',
                    protocol: 'Protocol',
                    info: 'Info',
                },
                direction: {
                    ingoing: 'Ingoing',
                    outgoing: 'Outgoing',
                },
                action: {
                    save: 'Save packets',
                    clear: 'Clear history',
                    filter: 'Filter',
                    gobottom: 'Scroll to bottom',
                },
            },
        },
        dialog: {
            common: {
                close: 'Close',
                cancel: 'Cancel',
                add: 'Add',
                send: 'Send',
                save: 'Save',
                remove: 'Remove',
                filename: 'File name',
            },
            about: {
                title: 'About',
                copyright: 'Copyright ©',
                notice: '$t(app.name) is released under the terms of the <license>GNU General Public License Affero version 3</license>.<br/>A copy of the source code is available <repo>here</repo>.',
                close: 'Close',
            },
            addhost: {
                title: 'Add Host',
                success: 'Host {{name}} added',
            },
            addhub: {
                title: 'Add Hub',
                success: 'Hub {{name}} added',
            },
            addinterface: {
                title: 'Add Interface',
                success: 'Interface {{name}} added',
            },
            addlink: {
                title: 'Add Link',
                success: 'Link added',
            },
            addstpswitch: {
                title: 'Add STP Switch',
                success: 'STP Switch {{name}} added',
            },
            addswitch: {
                title: 'Add Switch',
                success: 'Switch {{name}} added',
            },
            llctest: {
                title: 'Send LLC TEST',
            },
            pcap: {
                title: 'Save packets',
                success: 'Packets saved as {{name}}',
            },
            removedevice: {
                title: 'Remove device',
                success: 'Device {{name}} removed',
            },
            removelink: {
                title: 'Remove link',
                success: 'Link removed',
            },
            save: {
                title: 'Save',
                success: 'Network saved as {{name}}',
            },
        },
        field: {
            device: {
                label: 'Device',
            },
            interface: {
                label: 'Interface',
            },
            interfacename: {
                label: 'Name',
            },
            mac: {
                label: 'MAC Address',
                used: 'Warning: MAC address already in use',
            },
            name: {
                label: 'Name',
            },
            ports: {
                label: 'Ports',
            },
        },
        menu: {
            common: {
                host: 'Host',
                hub: 'Hub',
                switch: 'Switch',
                stpswitch: 'STP Switch',
                link: 'Link',
                device: 'Device',
            },
            add: {
                title: 'Add',
                tooltip: 'Add device',
            },
            remove: {
                title: 'Remove',
            },
            file: {
                title: 'File',
                save: 'Save',
                load: 'Load',
                example: {
                    title: 'Load example',
                    simple: {
                        title: 'Simple',
                        twohosts: 'Two hosts',
                        hub: 'Hub',
                        switch: 'Switch',
                        loop: 'Loop',
                    },
                    stp: {
                        title: 'STP',
                        triangle: 'Triangle',
                        complex: 'Complex STP',
                    },
                },
                clear: 'Clear',
                about: 'About',
            },
            view: {
                title: 'View',
            },
        },
        action: {
            restart: 'Restart simulation',
            pause: 'Pause simulation',
            play: 'Start simulation',
            dark: 'Dark mode',
            light: 'Light mode',
        },
        exception: {
            device: {
                interfacenametaken: 'Device {{name}} already has an interface named {{interface}}',
                interfacenotfound: 'Device {{name}} has no interface named {{interface}}',
                nofreeinterface: 'No free interfaces available on device {{name}}',
                deviceremoved: 'Device {{name}} has been removed',
            },
            interface: {
                connectiontoself: 'Tying to connect interface {{name}} to itself',
                alreadyconnected: 'Interface {{name}} is already connected',
                notinsamenetwork: 'Interface {{name}} and {{other}} are not in the same network',
                notconnected: 'Interface {{name}} is not connected',
                disconnected: 'Interface is disconnected',
            },
            network: {
                devicenametaken: 'Device {{name}} already exists in network',
                devicenotfound: 'Device {{name}} does net exist',
                alreadyrunning: 'Network is already running',
                notrunning: 'Network is not running',
                invalid: 'Invalid network',
            },
            ipv4: {
                invalid: 'Invalid IPv4 address {{address}}',
            },
            mac: {
                invalid: 'Invalid MAC address {{address}}',
            },
        },
    },
};
