import {Observable} from './observable'

export class ExtendableObservable extends Observable {
    args: any[];
    
    // common fields between view and ViewList
    // ...
    
    constructor(...args: any[]) {
        super();
    }
    
    // common methods between View and ViewList
    // ...
}
