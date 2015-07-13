
interface RoutingTable {
    route: string;
    document: EmitInfo;
    layout: EmitInfo;
    contents: EmitInfo[];
}

interface EmitInfo {
    className: string;
    importPath: string;
}

export function init(table: RoutingTable): void {
    
}