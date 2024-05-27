import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import * as XLSX from 'xlsx';


@Component({
	selector: 'app-bottom-sheet-banner-template-rules',
	templateUrl: 'bottom-sheet.template-rules.html',
	styleUrls: ['bottom-sheet.template-rules.scss']
})
export class BottomSheetTemplateRulesComponent {
	constructor(
		private _bottomSheetRef: MatBottomSheetRef<BottomSheetTemplateRulesComponent>,
		@Inject(MAT_BOTTOM_SHEET_DATA) public data: any[]
	) {
		console.log('BottomSheetBannerTemplateRulesComponent', data);
	}

	//generate characters based on rule Maximumcharacters
	private generateRandomWords(characterCount:number) {
		let text = "";
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		const chaactersLength = characters.length;

		for (let i = 0; i < characterCount; i++)
			text += characters.charAt(Math.floor(Math.random() * chaactersLength));

		return text;
	}

	public openLink(event: MouseEvent): void {

		const dataSheet:any = [];
		const columnames:any = [];

		for (let i = 0; i < this.data.length;i++)
		{

			if(this.data[i].type === "Text")
			{
				// https://www.samanthaming.com/tidbits/37-dynamic-property-name-with-es6/
				dataSheet.push(
					{
						[this.data[i].name]: `Maximum Characters: ${this.data[i].rules[0].maximumcharacters}` //this.generateRandomWords( this.data[i].rules[0].maximumcharacters )
					}
				);

				columnames.push({
					name: this.data[i].name,
					maxChar: this.data[i].rules[0].maximumcharacters
				});

			}
		}

		// making sure all the objects in DataSheet have the same heading/properties so that our spreadsheet
		// is properly populated
		dataSheet.forEach((x:any) => {
			columnames.forEach((y:any) => {
				if( !x.hasOwnProperty(y.name) ) {
					x[y.name] = `Maximum Characters: ${y.maxChar}` //this.generateRandomWords( y.maxChar )
				}
			});
		});

		//console.log("generate worksheet", dataSheet);
		// https://www.npmjs.com/package/xlsx#utility-functions
		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataSheet);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

		/* save to file */
		XLSX.writeFile(wb, 'Example_Template_Rules.xlsx');
		/**/

		this._bottomSheetRef.dismiss();
		event.preventDefault();
	}
}
