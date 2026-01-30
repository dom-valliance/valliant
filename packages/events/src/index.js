"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueName = void 0;
__exportStar(require("./definitions/event-types"), exports);
__exportStar(require("./publishers/event-publisher"), exports);
__exportStar(require("./subscribers/event-subscriber"), exports);
var QueueName;
(function (QueueName) {
    QueueName["REPORT_GENERATION"] = "report-generation";
    QueueName["AI_PROCESSING"] = "ai-processing";
    QueueName["NOTIFICATION"] = "notification";
    QueueName["DATA_EXPORT"] = "data-export";
    QueueName["AUDIT_LOG"] = "audit-log";
    QueueName["TIMESHEET_LOCK"] = "timesheet-lock";
    QueueName["BUDGET_CHECK"] = "budget-check";
})(QueueName || (exports.QueueName = QueueName = {}));
//# sourceMappingURL=index.js.map