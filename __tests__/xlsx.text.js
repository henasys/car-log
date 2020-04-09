import XLSX from 'xlsx';

it('xlsx_test', () => {
  var filename = 'test_excel.xlsx';
  var ws_name = 'TestSheet';
  var ws = XLSX.utils.aoa_to_sheet([
    'SheetJS'.split(''),
    [1, 2, 3, 4, 5, 6, 7],
    [2, 3, 4, 5, 6, 7, 8],
  ]);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, ws_name);
  XLSX.writeFile(wb, filename);
});
