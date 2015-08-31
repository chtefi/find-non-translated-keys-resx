# find-non-translated-keys-resx
Find the keys that are not translated in your .NET resx files.

## How to use it
Clone the repo and execute:

```
npm install
npm run list -- --langs fr,pt,de,es c:\Code\Desktop
```

## How does it work
It looks for every `.resx` in the folder you give, and all the lang variations
you want (in the example above : `.fr.resx`, `.pt.resx`, `.de.resx`, `.es.resx`),
then check if all the keys in the base `.resx` (which is the master language
resource file) exists in the other language (if the file exists).

## Structure expected
```
Settings.resx
Settings.fr.resx
Settings.pt.resx
Settings.de.resx
Settings.en.resx
```

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
variations, but they exist in `Settings.aspx.resx`.
