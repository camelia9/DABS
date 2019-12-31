import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedOutGuard implements CanActivate {
  constructor(private $router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.isUserLoggedOut()) {
      return true;
    }
    this.$router.navigate(['/'])
      .then();
    return false;
  }

  private isUserLoggedOut() {
    // verify cookie or verify active session by IP

    return true;
  }

}
