# jquery.lazytable
jquery-powered scrollable HTML table for large number of table rows.

This jQuery plugin is a variant of infinite scroll for tables (although, it currently requires the underlying data to have a fixed size). It enhances table load times by rendering only the visible rows of the table. All other rows are rendered on demand when scrolling the table.

## Limitations
* Tables must be scrollable (of course).
* Each row must have the same hight. Otherwise it will not be possible to calculate margins correctly - giving an incorrect focus or an incorrect scrollbar.
  You probably want to make sure (by providing proper CSS) that your table cells do not have line breaks, regardless of the browser's window size.
* Underlying data must be provided at initialization as an array.

## Usage
Include the dist/jquery.lazytable.min.js file and jQuery (tested with Version 2).

Make your table scrollable by introducing a wrapper div that encloses your table. The wrapper div should have a CSS height and `overflow-y: scroll` set.

```javascript
const tableData = [
  ['a1', 'a2', 'a3', 'a4'], /* row1 */
  ['b1', 'b2', 'b3', 'b4'], /* row2 */
  /* ... */
];

$('#tableWrapper').LazyTable({
   data: tableData
});
```

### Configuration
* `data`: An array of arrays representing the table data.
* `trHeight`: The height in pixels of a single row. If set to 0, the height will be determined after the first row has been rendered.
* `generator`: A callback function that can turn arrays into HTML code for a single table row.
* `startIndex`: The index of the table row that should be initially focused (defaults to 0).
* `keepExisting`: Whether or to keep rows (i.e. to not delete them) that are no longer visible (defaults to true).
* `prefetch`: Number of rows that should be build ahead of currently visible window (defaults to 0).
* `animationCalcTime`: Time in milliseconds that should be used for row creation (defaults to 3). Values higher than 16 will definitely push frame rate below 60Hz.
* `appendFn`: Callback function for appending rows. This function can return a jQuery deferred object, which will cause the table buildup to wait until this object is resolved.
* `prependFn`: Same as appendFn, but for rows that are prepended while scrolling up.
* `deleteFn`: Callback that is used for deleting rows when `keepExisting` is set to false. This function can return a jQuery deferred object, which will cause table buildup to wait until this object is resolved.
* `onInit`: Callback that is invoked when initialization is finished.
* `onRedraw`: Callback that in invoked when rows are added or removed from the table.

## TODO
* Restart plugin when doing rapid scrolls.
* Automatically add wrapper div to provide scrolling. Give hight as an initialisation parameter.
* Allow underlying data set to be extended on demand.
* Provide a more abstract model of the underlying data, to allow data being fetched from WebWorkers, JavaScript databases, etc.

## Development
Use `npm install` to download necessary packages.

Use `npm run build` to create a development build and `npm run deploy` to create a (minified) production build.

