import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

const fontSx = {
    fontFamily: 'Roboto Mono',
    fontSize: '14px',
    lineHeight: '21px',
    fontWeight: 'lighter',
    letterSpacing: 0,
};

export type Theme = {
    background: string;
    text: string;
    error: string;
    success: string;
    warning: string;
    border: string;
};

type PrintType = 'standard' | 'error' | 'success' | 'warning';

type Print = (text: string, type?: PrintType) => void;

type TermFunctions = {
    print: Print;
    clear: () => void;
};

type ParsedCommand = {
    command: string;
    args: string[];
    raw: string;
};

export type CommandFunc = (c: ParsedCommand, f: TermFunctions) => void;

type PrintEntry = {
    type: PrintType;
    text: string;
};

export const Terminal: React.FC<{
    prompt?: string;
    theme?: Theme;
    notFound?: CommandFunc;
    commands?: { [name: string]: CommandFunc };
    initval?: string;
}> = ({ prompt, theme, notFound, commands, initval }) => {
    const [buffer, setBuffer] = useState<PrintEntry[]>(
        initval === undefined ? [] : [{ type: 'standard', text: initval }]
    );
    let tmpBuff = buffer;
    const [input, setInput] = useState('');

    const endRef = useRef<HTMLSpanElement | null>(null);
    const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => scrollToBottom(), [buffer]);

    const print: Print = (text: string, type: PrintType = 'standard') => {
        tmpBuff = [
            ...tmpBuff,
            {
                type,
                text,
            },
        ];
        setBuffer(tmpBuff);
    };

    const clear = () => {
        tmpBuff = initval === undefined ? [] : [{ type: 'standard', text: initval }];
        setBuffer(tmpBuff);
    };

    const f: TermFunctions = { print, clear };

    const parse = (command: string): ParsedCommand => {
        const cmd = command.split(' ');
        return {
            raw: command,
            command: cmd.slice(0, 1)[0] ?? '',
            args: cmd.slice(1),
        };
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
                ...fontSx,
                background: theme.background,
                color: theme.text,
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1, overflowY: 'scroll', overflowX: 'hidden', padding: '4px' }}>
                    {buffer.map((entry, key) => (
                        <span
                            key={key}
                            style={{
                                color: {
                                    standard: theme.text,
                                    error: theme.error,
                                    success: theme.success,
                                    warning: theme.warning,
                                }[entry.type],
                            }}>
                            {entry.text}
                            {'\n'}
                        </span>
                    ))}
                    <span ref={endRef}></span>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid', borderColor: theme.border, padding: '2px' }}>
                    <span style={fontSx}>{prompt}</span>
                    <input
                        type='text'
                        spellCheck={false}
                        style={{
                            margin: 0,
                            padding: 0,
                            border: 'none',
                            overflow: 'auto',
                            outline: 'none',
                            boxShadow: 'none',
                            width: '100%',
                            ...fontSx,
                            background: theme.background,
                            color: theme.text,
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                print(prompt + input);
                                setInput('');
                                const cmd = parse(input);
                                if (cmd.command in commands) commands[cmd.command](cmd, f);
                                else notFound(cmd, f);
                            }
                        }}
                        onChange={(e) => {
                            setInput(e.currentTarget.value);
                        }}
                        value={input}
                    />
                </div>
            </div>
        </Box>
    );
};

Terminal.defaultProps = {
    prompt: '> ',
    theme: {
        background: 'rgba(0, 0, 0, 0)',
        text: 'rgba(0, 0, 0, 0.87)',
        error: '#d32f2f',
        success: '#2e7d32',
        warning: '#ed6c02',
        border: 'rgba(0, 0, 0, 0.12)',
    },
    notFound: ({ command }: ParsedCommand, { print }: TermFunctions) => {
        print(`Command ${command} not found!`, 'error');
    },
    commands: {},
};
