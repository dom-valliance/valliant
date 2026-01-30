"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectDto = exports.TeamModel = exports.ProjectType = exports.CommercialModel = exports.ProjectStatus = void 0;
const class_validator_1 = require("class-validator");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PROSPECT"] = "PROSPECT";
    ProjectStatus["DISCOVERY"] = "DISCOVERY";
    ProjectStatus["CONFIRMED"] = "CONFIRMED";
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["ON_HOLD"] = "ON_HOLD";
    ProjectStatus["COMPLETED"] = "COMPLETED";
    ProjectStatus["CANCELLED"] = "CANCELLED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var CommercialModel;
(function (CommercialModel) {
    CommercialModel["VALUE_SHARE"] = "VALUE_SHARE";
    CommercialModel["FIXED_PRICE"] = "FIXED_PRICE";
    CommercialModel["HYBRID"] = "HYBRID";
})(CommercialModel || (exports.CommercialModel = CommercialModel = {}));
var ProjectType;
(function (ProjectType) {
    ProjectType["BOOTCAMP"] = "BOOTCAMP";
    ProjectType["PILOT"] = "PILOT";
    ProjectType["USE_CASE_ROLLOUT"] = "USE_CASE_ROLLOUT";
})(ProjectType || (exports.ProjectType = ProjectType = {}));
var TeamModel;
(function (TeamModel) {
    TeamModel["THREE_IN_BOX"] = "THREE_IN_BOX";
    TeamModel["FLEXIBLE"] = "FLEXIBLE";
})(TeamModel || (exports.TeamModel = TeamModel = {}));
class CreateProjectDto {
    name;
    code;
    clientId;
    primaryPracticeId;
    valuePartnerId;
    status;
    commercialModel;
    estimatedValueCents;
    valueSharePct;
    agreedFeeCents;
    contingencyPct;
    startDate;
    endDate;
    projectType;
    parentProjectId;
    teamModel;
    notes;
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "primaryPracticeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "valuePartnerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ProjectStatus),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CommercialModel),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "commercialModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "estimatedValueCents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "valueSharePct", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "agreedFeeCents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "contingencyPct", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ProjectType),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "projectType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "parentProjectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TeamModel),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "teamModel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "notes", void 0);
//# sourceMappingURL=create-project.dto.js.map