import { Component, OnInit, ViewChild } from '@angular/core';
import { LabelsService } from '../../services/labels.service';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';

import { SelectionModel } from '@angular/cdk/collections';

@NgModule({
  imports: [MaterialModule],
})
@Component({
  selector: 'app-dashboard',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  providers: [ DatePipe]
})

export class LabelComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Modelo para el select
  selection = new SelectionModel<any>(true, []);

  // Elementos que se van a mostrar en la tabla
  displayedColumns: string[] = ['select', 'name', 'created_date'];

  // Aqui se carga lo devuelto por el servicio
  dataSource = new MatTableDataSource();

  //Aqui se guarda lo devuelto por el servicio
  allTagsResult: Array<any> = [];
  
  constructor(private labelsService: LabelsService, public dialog: MatDialog, private datePipe: DatePipe) {
    this.getAlltags();
    // Aqui se carga lo devuelto por el servicio
    //this.dataSource = new MatTableDataSource(this.allTagsResult);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  getAlltags() {
    this.labelsService.getAllTags().subscribe(
      data => {
        console.log(data)
        this.allTagsResult = data;
      },
      error => console.log("Error: ", error),
      () => this.refreshRows());
  }

  refreshRows(){
    this.dataSource = new MatTableDataSource(this.allTagsResult);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  openDialog(action, page, obj) {
    obj.action = action;
    obj.page = page;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '250px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Agregar'){
        this.addRowData(result.data);
      }else if(result.event == 'Editar'){
        // console.log(result.data);
        this.updateRowData(result.data);
      }else if(result.event == 'Eliminar'){
        this.deleteRowData(result.data);
      }
    });
  }

  onDelete(action: string, page: string){
    var rowsToDelete: Array<any> = this.selection.selected;

    if (rowsToDelete.length != 0){
      this.openDialog(action, page, rowsToDelete);
    }
  }

  addRowData(row_obj){
    var myDate = this.datePipe.transform( new Date(), 'yyyy-MM-dd');
    this.labelsService.addTag(row_obj.name).subscribe(
      data => {
        this.allTagsResult.unshift({id: data.id, name: data.name, created_date: myDate})
      },
      error => console.log("Error: ", error),
      () => this.refreshTable()
    );
  }

  updateRowData(row_obj){
    this.labelsService.updateTag(row_obj.id, row_obj.name);
    const foundIndex = this.allTagsResult.findIndex(x => x.id === row_obj.id);
    this.allTagsResult[foundIndex].name = row_obj.name;

    this.refreshTable();
    return true;
  }

  deleteRowData(row_obj){
    row_obj.forEach(
      row => {
        this.labelsService.deleteTag(row.id);
        const foundIndex = this.allTagsResult.findIndex(x => x.id === row.id);
        this.allTagsResult.splice(foundIndex, 1);
      }
    );

    this.selection = new SelectionModel<any>(true, []);
    this.refreshTable();
    return true;
  }

  refreshTable(){
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
