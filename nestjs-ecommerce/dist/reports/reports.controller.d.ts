import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getOrdersCsv(query: any, res: Response): Promise<void>;
}
