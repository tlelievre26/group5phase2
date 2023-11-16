import JSZip from 'jszip';
import logger from "../../utils/logger";


export function debloatZip(zip: JSZip): JSZip {
    var filesToDelete = [
        'docs/',        // Documentation files
        'test/',        // Test files
        'tests/',       // Test files (alternative folder name)
        'examples/',    // Example files
        'examples.js',  // Example JavaScript file
        'CHANGELOG',    // Change log file
        'CHANGELOG.md', // Change log file (Markdown format)
        'CONTRIBUTING', // Contributing guidelines
        'CONTRIBUTING.md', // Contributing guidelines (Markdown format)
        'yarn.lock',    // Yarn lock file
        '.gitignore',   // Git ignore file
        '.travis.yml',  // Travis CI configuration
        '.editorconfig', // Editor configuration
        'dist/'        // Distribution files
    ];

    filesToDelete.forEach(file => {
        logger.debug(`Removing ${file} from zip file`);
        zip.remove(file);
    });

    return zip;
}
