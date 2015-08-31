# find-non-translated-keys-resx
Find the keys that are not translated in your .NET resx language files.

It expects all the keys in your neutral language (`Settings.aspx.rex`) resource
file exist in your others languages files (`Settings.aspx.fr.resx`).

## How to use it
Clone the repo and execute:

```
npm install
npm run list -- --langs fr,pt,de,es c:\Code\Desktop
```

## How does it work
It looks for every `.resx` in the folder you give, and all the lang variations
you want (in the example above : `.fr.resx`, `.pt.resx`, `.de.resx`, `.es.resx`),
then check if all the keys in the base `.resx` (which is the neutral language
resource file) exists in the other language (if the file exists).

## Output
```
npm run list -- --langs fr,pt,de,es c:\Code\Desktop

c:/Code/Desktop/App_GlobalResources/Global.de.resx does not have those keys:
CloseDialog

c:/Code/Desktop/App_GlobalResources/Global.es.resx does not have those keys:
CloseDialog

c:/Code/Desktop/User/App_LocalResources/Settings.aspx.de.resx does not have those keys:
UserParameter

c:/Code/Desktop/User/App_LocalResources/Settings.aspx.es.resx does not have those keys:
UserParameter
```

Here, `CloseDialog` and `UserParameter` keys do not exist in the `de` and `es`
variations, but they exist in neutral `Settings.aspx.resx`.

## Structure expected
```
Settings.aspx.resx
Settings.aspx.fr.resx
Settings.aspx.pt.resx
Settings.aspx.de.resx
Settings.aspx.en.resx
```
