import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility } from '../animations/app.animation';
import { flyInOut, expand } from '../animations/app.animation';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
  animations: [
    visibility(),
    expand(),
    flyInOut()
  ]
})

export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishIds: string[];
    prev: string;
    next: string;
    errMess: string;

  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('cform') commentFormDirective;
  dishcopy: Dish;
  visibility = 'shown';


  formErrors = {
    author: '',
    comment: '',
    
    
  };

  validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment field is required.',
      'minlength':     'Name must be at least 8 characters long.',
      
    },
    
  }; 

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {  }

  ngOnInit() {
    this.createForm();

    this.dishService.getDishIds()
    .subscribe((dishIds) => this.dishIds = dishIds,
    errmess => this.errMess = <any>errmess);
     this.route.params
     .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
      .subscribe(dish => {this.dish = dish; this.dishcopy = dish; this.visibility = 'shown'; 
        errmess => this.errMess = <any>errmess; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1 ) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1 ) % this.dishIds.length];
  }

  goBack(): void { 
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      comment: ['', [Validators.required, Validators.minLength(4)] ],
      rating:  5,
    });

  this.commentForm.valueChanges
  .subscribe(data => this.onValueChanged(data));

  this.onValueChanged();

  }
  
  
  
  onSubmit() {
      this.comment = this.commentForm.value;
      // this.comment.author = this.commentForm.value.author;
      this.comment.date = new Date().toISOString();
      // this.comment.comment = this.commentForm.value.comment;
      // this.comment.rating = this.commentForm.value.rating;
      this.dishcopy.comments.push(this.comment);
      this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });


      this.commentFormDirective.resetForm();
      this.commentForm.reset({
        author: '',
        rating: 5,
        comment: '',
  
      });

    }


    
  // }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

}
