import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";

import { AgePipe } from "@app/shared/pipes/age.pipe";
import { SumByKeyPipe } from "@app/shared/pipes/sumbykey.pipe";
import { DateQuarterPipe } from "@app/shared/pipes/date.quarter.pipe";

@NgModule({
    declarations:[
        AgePipe,
		SumByKeyPipe,
		DateQuarterPipe
    ],
    imports:[
        CommonModule
    ],
    exports: [
        AgePipe,
		SumByKeyPipe,
		DateQuarterPipe
    ]
})

export class CustomPipeModule{}
