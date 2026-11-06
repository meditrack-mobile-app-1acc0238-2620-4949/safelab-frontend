import { assertDate, assertEnum, assertString } from './validators'
import { EvaluationResult } from '../models/evaluation-result'

export class ComplianceEvaluation {
  constructor({ id, evaluatedAt, result = EvaluationResult.Warning, notes = '' }) {
    assertString(id, 'ComplianceEvaluation.id')
    assertDate(evaluatedAt, 'ComplianceEvaluation.evaluatedAt')
    assertEnum(result, EvaluationResult, 'ComplianceEvaluation.result')
    assertString(notes, 'ComplianceEvaluation.notes')

    this.id = id
    this.evaluatedAt = evaluatedAt
    this.result = result
    this.notes = notes
  }

  approve() {
    this.result = EvaluationResult.Passed
  }

  reject() {
    this.result = EvaluationResult.Failed
  }

  addNotes(notes) {
    assertString(notes, 'ComplianceEvaluation.notes')
    this.notes = notes
  }
}

