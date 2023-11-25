
function getNoteByIndex(index) {
    if (index == 1 || index == 1 + 12 || index == 1 + 24) return 'Do';
    if (index == 2 || index == 2 + 12) return 'Do#';
    if (index == 3 || index == 3 + 12) return 'Re';
    if (index == 4 || index == 4 + 12) return 'Re#';
    if (index == 5 || index == 5 + 12) return 'Mi';
    if (index == 6 || index == 6 + 12) return 'Fa';
    if (index == 7 || index == 7 + 12) return 'Fa#';
    if (index == 8 || index == 8 + 12) return 'Sol';
    if (index == 9 || index == 9 + 12) return 'Sol#';
    if (index == 10 || index == 10 + 12) return 'La';
    if (index == 11 || index == 11 + 12) return 'La#';
    if (index == 12 || index == 12 + 12) return 'Si';
}