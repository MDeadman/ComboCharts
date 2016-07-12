/*__________________________________________________________
|                                              __           |
|                _   /\                 ____  /  \/\    ____|
|               / \_/  \               /    \/      \__/    |
|              /        COMBO CHARTS  /                     |
|   ___       /            v0.1               __  /\        |
|  /   \     /        Matthew Deadman        /  \/  \       |
|_/    _\___/  Charting Library based on d3.js       \      |
|   __/  \       / \        \     /        /          \     |
|  /      \__   /   \___/\   \___/___    _/            \    |
| /          \_/          \   __/    \__/               \___|
|/                         \_/                              |
|__________________________________________________________*/

//'use strict';

var ComboChart = {
  version: '0.1'
}

require('./core/ChartArea.js')(ComboChart);

module.exports = ComboChart;