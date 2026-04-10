import { Controller, Get, Query, Res, Header, UsePipes } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe';
import { GetReportSchema } from './validators/reports.validator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('orders/csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=orders-report.csv')
  @UsePipes(new JoiValidationPipe(GetReportSchema))
  async getOrdersCsv(
    @Query() query: any,
    @Res() res: Response
  ) {
    // report
    const csv = await this.reportsService.generateOrdersReport(query.startTime, query.endTime, query.sortBy);
    res.status(200).send(csv);
  }
}
