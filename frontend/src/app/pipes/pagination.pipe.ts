import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'pagination'
})
export class PaginationPipe implements PipeTransform {

  transform<T>(list: Array<T>, pageNumber: number, pageSize: number): Array<T> {
    return list.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);
  }

}
