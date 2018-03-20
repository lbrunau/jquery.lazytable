# jquery.lazytable
jquery-powered scrollable HTML table for large number of table rows.

This jQuery plugin is a variant of infinite scroll for tables (although, it currently requires the underlying data to have a fixed size). It enhances table load times by rendering only the visible rows of the table. All other rows are rendered on demand when scrolling the table.

## Limitations
* Tables must be scrollable (of course).
* Each row must have the same hight. Otherwise it will not be possible to calculate margins correctly - giving an incorrect focus or an incorrect scrollbar.
** You probably want to make sure (by providing proper CSS) that your table cells do not have line breaks, regardless of the browser's window size.
* Underlying data must be provided at initialization as an array.

## TODO
* Restart plugin when doing rapid scrolls.
* Allow underlying data set to be extended on demand.
* Provide a more abstract model of the underlying data, to allow data being fetched from WebWorkers, JavaScript databases, etc.

## Development
Use `npm install` to download necessary packages.

Use `npm run build` to create a development build and `npm run deploy` to create a (minified) production build.

