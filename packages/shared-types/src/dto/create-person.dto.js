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
exports.CreatePersonDto = exports.Seniority = exports.PersonType = void 0;
const class_validator_1 = require("class-validator");
var PersonType;
(function (PersonType) {
    PersonType["EMPLOYEE"] = "EMPLOYEE";
    PersonType["CONTRACTOR"] = "CONTRACTOR";
})(PersonType || (exports.PersonType = PersonType = {}));
var Seniority;
(function (Seniority) {
    Seniority["JUNIOR"] = "JUNIOR";
    Seniority["MID"] = "MID";
    Seniority["SENIOR"] = "SENIOR";
    Seniority["PRINCIPAL"] = "PRINCIPAL";
    Seniority["PARTNER"] = "PARTNER";
})(Seniority || (exports.Seniority = Seniority = {}));
class CreatePersonDto {
    name;
    email;
    type;
    roleId;
    departmentId;
    costRateCents;
    costRateCurrency;
    defaultHoursPerWeek;
    workingDays;
    seniority;
    utilisationTarget;
    startDate;
    endDate;
    notes;
    practiceIds;
}
exports.CreatePersonDto = CreatePersonDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PersonType),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "roleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePersonDto.prototype, "costRateCents", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "costRateCurrency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePersonDto.prototype, "defaultHoursPerWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePersonDto.prototype, "workingDays", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Seniority),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "seniority", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePersonDto.prototype, "utilisationTarget", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePersonDto.prototype, "practiceIds", void 0);
//# sourceMappingURL=create-person.dto.js.map