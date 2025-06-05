export function getUserHomeDir() {
    ObjC.import('stdlib'); // TODO: consolidate this into a single import statement?
    const home = $.getenv('HOME');
    return home;
}
