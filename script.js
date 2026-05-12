class TerminalOS {
    constructor() {
        this.outputElement = document.getElementById('output');
        this.inputElement = document.getElementById('input');
        
        this.currentApp = null;
        this.apps = {};
        
        this.initializeGodApp();
        
        this.inputElement.addEventListener('keydown', (e) => this.handleInput(e));
        
        this.printWelcome();
    }
    
    initializeGodApp() {
        this.apps['GOD'] = {
            name: 'GOD',
            description: 'The app creator - can create new apps',
            execute: (input) => this.godAppLogic(input)
        };
    }
    
    godAppLogic(input) {
        const trimmed = input.trim();
        
        if (!trimmed) {
            return `GOD APP - App Creator
            
Commands:
  create <name> | <description> | <logic>
  
Example:
  create ECHO | Echoes input back | return input;
  create UPPER | Converts to uppercase | return input.toUpperCase();
  create REVERSE | Reverses text | return input.split('').reverse().join('');
  
The logic should be JavaScript that uses 'input' variable and returns a string.`;
        }
        
        if (trimmed.startsWith('create ')) {
            const parts = trimmed.substring(7).split('|').map(p => p.trim());
            
            if (parts.length !== 3) {
                return 'Error: Invalid format. Use: create <name> | <description> | <logic>';
            }
            
            const [name, description, logic] = parts;
            
            if (!name || !description || !logic) {
                return 'Error: Name, description, and logic cannot be empty';
            }
            
            const upperName = name.toUpperCase();
            
            if (upperName === 'GOD' || upperName === 'LIST' || upperName === 'USE' || upperName === 'HELP') {
                return `Error: Cannot create app named '${upperName}' - reserved name`;
            }
            
            if (this.apps[upperName]) {
                return `Error: App '${upperName}' already exists`;
            }
            
            try {
                const appFunction = new Function('input', logic);
                
                this.apps[upperName] = {
                    name: upperName,
                    description: description,
                    execute: appFunction
                };
                
                return `Success! App '${upperName}' created.
Description: ${description}
Use with: /use ${upperName}`;
            } catch (error) {
                return `Error: Invalid JavaScript logic - ${error.message}`;
            }
        }
        
        return 'Unknown GOD command. Type nothing for help.';
    }
    
    printWelcome() {
        this.print('='.repeat(60), 'success-line');
        this.print('TERMINAL OS v1.0 - APP FRAMEWORK', 'success-line');
        this.print('='.repeat(60), 'success-line');
        this.print('');
        this.print('Welcome to Terminal OS!', 'info-line');
        this.print('A text-based application framework.', 'info-line');
        this.print('');
        this.print('Available commands:', 'response-line');
        this.print('  help     - Show all commands', 'response-line');
        this.print('  /list    - List all available apps', 'response-line');
        this.print('  /use     - Use an app', 'response-line');
        this.print('  clear    - Clear terminal', 'response-line');
        this.print('');
        this.print('The GOD app is pre-installed - use it to create more apps!', 'info-line');
        this.print('Try: /use GOD', 'info-line');
        this.print('');
    }
    
    handleInput(e) {
        if (e.key === 'Enter') {
            const input = this.inputElement.value;
            this.inputElement.value = '';
            
            if (this.currentApp) {
                this.printCommand(`${this.currentApp}> ${input}`);
                this.executeApp(input);
            } else {
                this.printCommand(`$ ${input}`);
                this.processCommand(input);
            }
            
            this.scrollToBottom();
        }
    }
    
    processCommand(input) {
        const trimmed = input.trim();
        
        if (!trimmed) {
            return;
        }
        
        const parts = trimmed.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');
        
        switch(command) {
            case 'help':
                this.showHelp();
                break;
            
            case '/list':
                this.listApps();
                break;
            
            case '/use':
                this.useApp(args);
                break;
            
            case 'clear':
                this.clearTerminal();
                break;
            
            case 'exit':
                if (this.currentApp) {
                    this.exitApp();
                } else {
                    this.print('No app running. Use /use <app> to start an app.', 'error-line');
                }
                break;
            
            default:
                this.print(`Unknown command: ${command}`, 'error-line');
                this.print('Type "help" for available commands', 'info-line');
        }
    }
    
    showHelp() {
        this.print('Available Commands:', 'success-line');
        this.print('');
        this.print('  help                 Show this help message', 'response-line');
        this.print('  /list                List all available apps', 'response-line');
        this.print('  /use <app>           Use/run an app', 'response-line');
        this.print('  exit                 Exit current app', 'response-line');
        this.print('  clear                Clear the terminal', 'response-line');
        this.print('');
        this.print('App Usage:', 'success-line');
        this.print('  Once in an app, type your input and press Enter', 'response-line');
        this.print('  The app will process and return output', 'response-line');
        this.print('  Type "exit" to leave the app', 'response-line');
    }
    
    listApps() {
        const appList = Object.values(this.apps);
        
        if (appList.length === 0) {
            this.print('No apps available.', 'info-line');
            return;
        }
        
        this.print(`Available Apps (${appList.length}):`, 'success-line');
        this.print('');
        
        appList.forEach(app => {
            this.print(`  ${app.name}`, 'success-line');
            this.print(`    ${app.description}`, 'response-line');
            this.print('');
        });
        
        this.print('Use an app with: /use <appname>', 'info-line');
    }
    
    useApp(appName) {
        if (!appName) {
            this.print('Usage: /use <appname>', 'error-line');
            this.print('Type /list to see available apps', 'info-line');
            return;
        }
        
        const upperName = appName.trim().toUpperCase();
        
        if (!this.apps[upperName]) {
            this.print(`App '${upperName}' not found.`, 'error-line');
            this.print('Type /list to see available apps', 'info-line');
            return;
        }
        
        this.currentApp = upperName;
        this.print(`Launching ${upperName}...`, 'success-line');
        this.print('');
        
        const welcomeMessage = this.apps[upperName].execute('');
        if (welcomeMessage) {
            welcomeMessage.split('\n').forEach(line => {
                this.print(line, 'info-line');
            });
            this.print('');
        }
        
        this.print('Type your input and press Enter. Type "exit" to quit app.', 'info-line');
        this.print('');
        
        this.updatePrompt();
    }
    
    executeApp(input) {
        if (input.trim().toLowerCase() === 'exit') {
            this.exitApp();
            return;
        }
        
        try {
            const result = this.apps[this.currentApp].execute(input);
            
            if (result) {
                result.toString().split('\n').forEach(line => {
                    this.print(line, 'app-input-line');
                });
            }
        } catch (error) {
            this.print(`Error: ${error.message}`, 'error-line');
        }
        
        this.print('');
    }
    
    exitApp() {
        this.print(`Exiting ${this.currentApp}...`, 'info-line');
        this.print('');
        this.currentApp = null;
        this.updatePrompt();
    }
    
    clearTerminal() {
        this.outputElement.innerHTML = '';
    }
    
    updatePrompt() {
        const promptElement = document.querySelector('.prompt');
        if (this.currentApp) {
            promptElement.textContent = `${this.currentApp}>`;
        } else {
            promptElement.textContent = '$';
        }
    }
    
    printCommand(text) {
        const line = document.createElement('div');
        line.className = 'command-line';
        line.textContent = text;
        this.outputElement.appendChild(line);
    }
    
    print(text, className = 'response-line') {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        this.outputElement.appendChild(line);
    }
    
    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TerminalOS();
});