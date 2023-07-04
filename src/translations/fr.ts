export const fr = {
    translation: {
        lang: '🇫🇷 Français',
        app: {
            name: 'Näthaj',
            namever: '$t(app.name) {{version}}',
            version: 'Version {{version}}',
            description: 'Simulateur réseau web écrit en TypeScript avec la librairie React',
        },
        panel: {
            network: {
                title: 'Réseau',
                action: {
                    removedev: 'Supprimer un périphérique',
                    addlink: 'Ajouter un lien',
                    removelink: 'Supprimer un lien',
                    autolayout: 'Disposition automatique',
                    centerview: 'Centrer la vue',
                    labels: 'Activer / Désactiver les étiquettes',
                    snap: "Activer / Désactiver l'alignement sur la grille",
                    grid: 'Activer / Désactiver la grille',
                },
                snack: {
                    linkadded: 'Lien ajouté',
                    linkremoved: 'Lien supprimé',
                    deviceremoved: 'Le périphérique {{name}} a été supprimé',
                },
                render: {
                    offset: 'Position: {{x}};{{y}}',
                    scale: 'Zoom: {{scale}}',
                    time: 'Temps: {{time}}',
                },
            },
            properties: {
                title: 'Propriétés',
                titleof: 'Propriétés de {{name}}',
                nodevice: 'Pas de périphérique sélectionné',
                action: {
                    addintf: 'Ajouter une interface',
                    delete: 'Supprimer',
                },
                host: {
                    action: {
                        llctest: 'Envoyer TEST LLC',
                    },
                    snack: {
                        llcsent: 'TEST LLC Envoyé',
                        llcrunning: 'TEST LLC Déjà en cours',
                        llcsuccess: 'TEST LLC Réussi',
                        llctimeout: 'TEST LLC Expiré',
                    },
                },
                stpswitch: {
                    priority: 'Priorité',
                    role: 'Rôle',
                    roles: {
                        Root: 'Racine',
                        Designated: 'Désigné',
                        Blocking: 'Bloquant',
                        Disabled: 'Désactivé',
                    },
                    state: 'State',
                    states: {
                        Blocking: 'Bloquant',
                        Listening: 'Écoute',
                        Learning: 'Apprentissage',
                        Forwarding: 'Transmission',
                        Disabled: 'Désactivé',
                    },
                    cost: 'Coût',
                    action: {
                        enable: 'Activé',
                        disable: 'Désactivé',
                    },
                },
                macaddresstable: {
                    title: "Table d'adresses MAC",
                    mac: 'MAC',
                    interface: 'Interface',
                    empty: 'Vide',
                },
                mac: {
                    title: 'Adresse MAC',
                },
                pos: {
                    x: 'X',
                    y: 'Y',
                },
                type: 'Type',
                name: 'Nom',
                interface: 'Interface {{name}}',
                connectedto: 'Connectée à',
                notconnected: 'Non-connecté',
                save: 'Sauvegarder',
                cancel: 'Annuler',
            },
            analyzer: {
                title: 'Analyseur de paquets',
                nopackets: 'Aucun paquet à afficher',
                columns: {
                    id: 'N°',
                    time: 'Temps',
                    origin: 'Origine',
                    direction: 'Direction',
                    source: 'Source',
                    destination: 'Destination',
                    protocol: 'Protocole',
                    info: 'Infos',
                },
                direction: {
                    ingoing: 'Entrant',
                    outgoing: 'Sortant',
                },
                action: {
                    save: 'Enregistrer les paquets',
                    clear: "Effacer l'historique",
                    filter: 'Filtres',
                    gobottom: 'Défiler vers le bas',
                },
            },
        },
        dialog: {
            common: {
                close: 'Fermer',
                cancel: 'Annuler',
                add: 'Ajouter',
                send: 'Envoyer',
                save: 'Sauvegarder',
                remove: 'Supprimer',
                filename: 'Nom du fichier',
            },
            about: {
                title: 'À propos',
                copyright: 'Copyright ©',
                notice: '$t(app.name) est publié sous les termes de la <license>Licence Publique Générale GNU Affero, version 3</license>.<br/>Une copie du code source est disponible <repo>ici</repo>.',
            },
            addhost: {
                title: 'Ajouter un Hôte',
                success: 'Hôte {{name}} ajouté',
            },
            addhub: {
                title: 'Ajouter un Hub',
                success: 'Hub {{name}} ajouté',
            },
            addinterface: {
                title: 'Ajouter une Interface',
                success: 'Interface {{name}} ajoutée',
            },
            addlink: {
                title: 'Ajouter un lien',
                success: 'Lien ajouté',
            },
            addstpswitch: {
                title: 'Ajouter un Switch STP',
                success: 'Switch STP {{name}} ajouté',
            },
            addswitch: {
                title: 'Ajouter un Switch',
                success: 'Switch {{name}} ajouté',
            },
            llctest: {
                title: 'Envoyer un TEST LLC',
            },
            pcap: {
                title: 'Enregistrer les paquets',
                success: 'Paquets enregistrés sous {{name}}',
            },
            removedevice: {
                title: 'Supprimer un périphérique',
                success: 'Périphérique {{name}} supprimé',
            },
            removelink: {
                title: 'Supprimer un lien',
                success: 'Lien supprimé',
            },
            save: {
                title: 'Sauvegarder',
                success: 'Réseau enregistré sous {{name}}',
            },
            shortcuts: {
                space: 'espace',
                title: 'Raccourcis Clavier',
                open: "Ouvrir l'aide des Raccourcis Clavier",
                files: {
                    title: 'Fichiers',
                    save: 'Sauvegarder',
                    load: 'Charger',
                },
                view: {
                    title: 'Affichage',
                    network: 'Afficher le Réseau',
                    properties: 'Afficher les propriétés',
                    analyzer: "Afficher l'Analyseur de paquets",
                },
                simulation: {
                    title: 'Simulation',
                    play: 'Démarrer / Mettre en pause la simulation',
                    restart: 'Réinitialiser la simulation',
                },
            },
        },
        field: {
            device: {
                label: 'Périphérique',
            },
            interface: {
                label: 'Interface',
            },
            interfacename: {
                label: 'Nom',
            },
            mac: {
                label: 'Adresse MAC',
                used: 'Attention: Adresse MAC déjà utilisée',
            },
            name: {
                label: 'Nom',
            },
            ports: {
                label: 'Ports',
            },
        },
        menu: {
            common: {
                host: 'Hôte',
                hub: 'Hub',
                switch: 'Switch',
                stpswitch: 'Switch STP',
                link: 'Link',
                device: 'Device',
            },
            add: {
                title: 'Ajouter',
                tooltip: 'Ajouter un périphérique',
            },
            remove: {
                title: 'Supprimer',
            },
            file: {
                title: 'Fichier',
                save: 'Sauvegarder',
                load: 'Charger',
                loaded: 'Chargement réussi',
                example: {
                    title: 'Charger un exemple',
                    simple: {
                        title: 'Simple',
                        twohosts: 'Deux hôtes',
                        hub: 'Hub',
                        switch: 'Switch',
                        loop: 'Bouche',
                    },
                    stp: {
                        title: 'STP',
                        triangle: 'Triangle',
                        complex: 'STP Complexe',
                    },
                },
                clear: 'Effacer',
            },
            view: {
                title: 'Affichage',
            },
            help: {
                title: 'Aide',
                about: 'À propos',
                shortcuts: 'Raccourcis Clavier',
            },
        },
        action: {
            restart: 'Redémarrer la simulation (S)',
            pause: 'Mettre la simulation en pause (Espace)',
            play: 'Démarrer simulation (Espace)',
            dark: 'Mode sombre',
            light: 'Mode clair',
        },
        exception: {
            device: {
                interfacenametaken: 'Le périphérique {{name}} possède déjà une interface nommée {{interface}}',
                interfacenotfound: "Le périphérique {{name}} n'a pas d'interface nommée {{interface}}",
                nofreeinterface: "Aucune interface libre n'est disponible sur le périphérique {{name}}",
                deviceremoved: 'Le périphérique {{name}} a été supprimé',
            },
            interface: {
                connectiontoself: "Impossible de connecter l'interface {{name}} à elle-même",
                alreadyconnected: "L'interface {{name}} est déjà connectée",
                notinsamenetwork: 'Les interfaces {{name}} et {{other}} ne sont pas dans le même réseau',
                notconnected: "L'interface {{name}} n'est pas connectée",
                disconnected: "L'interface est déconnectée",
            },
            network: {
                devicenametaken: 'Le périphérique {{name}} existe déjà dans le réseau',
                devicenotfound: "Le périphérique {{name}} n'existe pas",
                alreadyrunning: "La simulation du réseau est déjà en cours d'exécution",
                notrunning: "La simulation du réseau n'est pas en cours d'exécution",
                invalid: 'Réseau invalide',
            },
            ipv4: {
                invalid: "L'adresse {{address}} n'est pas une adresse IPv4 valide",
            },
            mac: {
                invalid: "L'adresse {{address}} n'est pas une adresse MAC valide",
            },
        },
    },
};
