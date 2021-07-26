import fetch from 'node-fetch';
import * as vscode from 'vscode';

export class CrpytoProvider implements vscode.TreeDataProvider<Crpyto> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<Crpyto | undefined | null | void> = new vscode.EventEmitter<Crpyto | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Crpyto | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor () {}

    async getCrpytos(): Promise<Crpyto[]> {
        try {
            const response =  await fetch('https://api.coincap.io/v2/assets');
            const coincap = await response.json();
            let crpyto: Crpyto[] = coincap.data.map((crpyto: any) => {
                const graph = (crpyto.changePercent24Hr >= 0 ? '🟩' : '🟥') + ` ${crpyto.symbol} `;
                return new Crpyto(
                    `${graph} ${crpyto.name} --> `, 
                    `$${parseFloat(crpyto.priceUsd).toFixed(2)}`, 
                    this.getCrpytoDetails(crpyto)
                );
            });
            return crpyto;
        } catch (error) {
            vscode.window.showInformationMessage(`${error}`);
        }

        return [];
    }

    getCrpytoDetails(crpyto: any): Crpyto[] {
        const graph = crpyto.changePercent24Hr >= 0 ? '⬆️' : '⬇️';
        return [
            new Crpyto('🧭 Explorer', `${crpyto.explorer}`),
            new Crpyto(`${graph} Change (24Hr)`, `${parseFloat(crpyto.changePercent24Hr).toFixed(2)}%`),
            new Crpyto('🧢 Market Cap', `$${this.convertNumber(crpyto.marketCapUsd)}`),
            new Crpyto('🔈 Volume USD(24Hr)', `$${this.convertNumber(crpyto.volumeUsd24Hr)}`),
        ];
    }

    getTreeItem(element: Crpyto): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: Crpyto|undefined): vscode.ProviderResult<Crpyto[]> { 
        if (element === undefined) {
            return Promise.resolve(this.getCrpytos());
          }
        
          return element.children;
    }

    convertNumber(labelValue: string) {
        const sign = Math.sign(Number(labelValue));

        // Nine Zeroes for Billions
        return Math.abs(Number(labelValue)) >= 1.0e+9

        ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + "B"
        // Six Zeroes for Millions 
        : Math.abs(Number(labelValue)) >= 1.0e+6

        ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2)  + "M"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

        ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2)  + "K"

        : Math.abs(Number(labelValue));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}

class Crpyto extends vscode.TreeItem {
    children: Crpyto[] | undefined;

    constructor(label: string, price: string, children?: Crpyto[]) {
        super(label,  children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Collapsed);
        this.children = children;
        this.description = price;
    }    
}