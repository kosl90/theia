const cp = require('child_process');

console.log('Extracting all localization calls...');
performNlsExtract();
if (hasNlsFileChanged()) {
    const token = getDeepLToken();
    if (token) {
        console.log('Performing DeepL translation...');
        performDeepLTranslation(token);
        console.log('Commiting and pushing changes...');
        commitChanges('Theia Translation Bot');
        console.log('Translation finished successfully!');
    } else {
        console.log('No DeepL API token found in env');
        process.exit(1);
    }
} else {
    console.log('No localization changes found.');
}

function performNlsExtract() {
    cp.spawnSync('yarn', [
        'theia', 'nls-extract',
        '-o', './packages/core/i18n/nls.json',
        '-e', 'vscode',
        '-f', './packages/**/browser/**/*.{ts,tsx}'
    ], {
        shell: true
    });
}

function hasNlsFileChanged() {
    const childProcess = cp.spawnSync('git', ['diff', '--exit-code', './packages/core/i18n/nls.json']);
    return childProcess.status === 1;
}

function getDeepLToken() {
    return process.env['DEEPL_API_TOKEN'];
}

function performDeepLTranslation(token) {
    cp.spawnSync('yarn', [
        'theia', 'nls-localize',
        '-f', './packages/core/i18n/nls.json',
        '--free-api', '-k', token,
        'cs', 'de', 'es', 'fr', 'hu', 'it', 'ja', 'pl', 'pt-br', 'pt-pt', 'ru', 'zh-cn'
    ], {
        shell: true
    });
}

function commitChanges(user) {
    // Set user and email
    cp.spawnSync('git', ['config', 'user.name', user]);
    cp.spawnSync('git', ['config', 'user.email', '<>']);
    // Stage everything
    cp.spawnSync('git', ['add', '-A']);
    // Commit and push the changes
    cp.spawnSync('git', ['commit', '-m', 'Automatic translation update']);
    cp.spawnSync('git', ['push']);
}
