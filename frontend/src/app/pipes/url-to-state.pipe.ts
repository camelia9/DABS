import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'urlToState'
})
export class UrlToStatePipe implements PipeTransform {

  transform(url: string): string {
    return url.slice(1);
  }

}
