//
const unit = document.getElementById ('unicode-normalizer-unit');
//
const clearButton = unit.querySelector ('.clear-button');
const charactersSamples = unit.querySelector ('.characters-samples');
const loadButton = unit.querySelector ('.load-button');
const saveButton = unit.querySelector ('.save-button');
const charactersInput = unit.querySelector ('.characters-input');
const codePointsInput = unit.querySelector ('.code-points-input');
const charactersStrings = unit.getElementsByClassName ('characters-string');
const codePointsStrings = unit.getElementsByClassName ('code-points-string');
//
const instructions = unit.querySelector ('.instructions');
//
let defaultFolderPath;
//
module.exports.start = function (context)
{
    const pullDownMenus = require ('../../lib/pull-down-menus.js');
    const sampleMenus = require ('../../lib/sample-menus');
    //
    const path = require ('path');
    //
    const fileDialogs = require ('../../lib/file-dialogs.js');
    //
    const unicode = require ('../../lib/unicode/unicode.js');
    //
    const defaultPrefs =
    {
        charactersInput: "",
        instructions: true,
        defaultFolderPath: context.defaultFolderPath
    };
    let prefs = context.getPrefs (defaultPrefs);
    //
    clearButton.addEventListener
    (
        'click',
        event =>
        {
            charactersInput.value = "";
            charactersInput.dispatchEvent (new Event ('input'));
        }
    );
    //
    const samples = require ('./samples.json');
    //
    let charactersMenu = sampleMenus.makeMenu
    (
        samples,
        (sample) =>
        {
            charactersInput.value = sample.string;
            charactersInput.dispatchEvent (new Event ('input'));
        }
    );
    //
    charactersSamples.addEventListener
    (
        'click',
        event =>
        {
            pullDownMenus.popup (event.target.getBoundingClientRect (), charactersMenu);
        }
    );
    //
    defaultFolderPath = prefs.defaultFolderPath;
    //
    loadButton.addEventListener
    (
        'click',
        event =>
        {
            fileDialogs.loadTextFile
            (
                "Load text file:",
                [ { name: "Text (*.txt)", extensions: [ 'txt' ] } ],
                defaultFolderPath,
                'utf8',
                (text, filePath) =>
                {
                    charactersInput.value = text;
                    charactersInput.dispatchEvent (new Event ('input'));
                    defaultFolderPath = path.dirname (filePath);
                }
            );
        }
    );
    //
    saveButton.addEventListener
    (
        'click',
        event =>
        {
            fileDialogs.saveTextFile
            (
                "Save text file:",
                [ { name: 'Text (*.txt)', extensions: [ 'txt' ] } ],
                defaultFolderPath,
                (filePath) =>
                {
                    defaultFolderPath = path.dirname (filePath);
                    return charactersInput.value;
                }
            );
        }
    );
    //
    charactersInput.addEventListener
    (
        'input',
        event =>
        {
            let characters = event.target.value;
            codePointsInput.value = unicode.charactersToCodePoints (characters);
            for (let index = 0; index < charactersStrings.length; index++)
            {
                let charactersString = charactersStrings[index];
                let codePointsString = codePointsStrings[index];
                charactersString.textContent = characters.normalize (charactersString.dataset.form);
                codePointsString.textContent = unicode.charactersToCodePoints (charactersString.textContent);
            }
        }
    );
    charactersInput.value = prefs.charactersInput;
    charactersInput.dispatchEvent (new Event ('input'));
    //
    codePointsInput.addEventListener
    (
        'input',
        event =>
        {
            let characters = unicode.codePointsToCharacters (event.target.value);
            charactersInput.value = characters;
            for (let index = 0; index < charactersStrings.length; index++)
            {
                let charactersString = charactersStrings[index];
                let codePointsString = codePointsStrings[index];
                charactersString.textContent = characters.normalize (charactersString.dataset.form);
                codePointsString.textContent = unicode.charactersToCodePoints (charactersString.textContent);
            }
        }
    );
    codePointsInput.addEventListener
    (
        'blur',
        event =>
        {
            event.target.value = unicode.charactersToCodePoints (charactersInput.value);
        }
    );
    codePointsInput.addEventListener
    (
        'keypress',
        event =>
        {
            if (event.key === "Enter")
            {
                event.preventDefault (); // ??
                event.target.value = unicode.charactersToCodePoints (charactersInput.value);
            }
        }
    );
    //
    instructions.open = prefs.instructions;
};
//
module.exports.stop = function (context)
{
    let prefs =
    {
        charactersInput: charactersInput.value,
        instructions: instructions.open,
        defaultFolderPath: defaultFolderPath
    };
    context.setPrefs (prefs);
};
//
