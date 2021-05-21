"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer_1 = __importDefault(require("inquirer"));
var axios_1 = __importDefault(require("axios"));
var config_json_1 = __importDefault(require("./config.json"));
var constants_1 = __importDefault(require("./constants"));
var calcTimeDiff = function (_a, _b) {
    var startHours = _a[0], startMinutes = _a[1];
    var endHours = _b[0], endMinutes = _b[1];
    var before = new Date();
    before.setHours(startHours);
    before.setMinutes(startMinutes);
    before.setSeconds(0);
    before.setMilliseconds(0);
    var after = new Date(before.getTime());
    after.setHours(endHours);
    after.setMinutes(endMinutes);
    var milliDiff = after.getTime() - before.getTime();
    return (((milliDiff / 1000) / 60) / 60).toFixed(2);
};
var toBase64 = function (pat) {
    var buff = Buffer.from(pat, 'utf-8');
    return buff.toString('base64');
};
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var answers, mergedAnswers, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer_1.default.prompt([
                        { name: 'URL', message: 'What is your ADO URL?', when: function () { return typeof config_json_1.default.URL !== 'string' || config_json_1.default.URL.length === 0; } },
                        { name: 'PAT', message: 'What is your PAT?', when: function () { return typeof config_json_1.default.PAT !== 'string' || config_json_1.default.PAT.length === 0; } },
                        { name: 'wi', message: 'WI number?' },
                        { name: 'start', message: 'Start time?' },
                        { name: 'end', message: 'End time?' },
                    ])];
                case 1:
                    answers = _a.sent();
                    mergedAnswers = __assign(__assign({}, config_json_1.default), answers);
                    axios_1.default.defaults.baseURL = config_json_1.default.URL;
                    axios_1.default.defaults.headers.common.Authorization = "Basic " + toBase64(":" + config_json_1.default.PAT);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.patch("wit/workitems/" + mergedAnswers.wi + "?api-version=" + constants_1.default.ADO.VERSION, [{
                                op: 'replace',
                                path: "/fields/" + constants_1.default.ADO.FIELDS.COMPLETED,
                                value: calcTimeDiff([parseInt(mergedAnswers.start.slice(0, 2), 10), parseInt(mergedAnswers.start.slice(2, 4), 10)], [parseInt(mergedAnswers.end.slice(0, 2), 10), parseInt(mergedAnswers.end.slice(2, 4), 10)])
                            }], {
                            headers: {
                                'Content-Type': 'application/json-patch+json'
                            }
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    throw new Error(err_1);
                case 5: return [2 /*return*/];
            }
        });
    });
}
init();
//# sourceMappingURL=index.js.map