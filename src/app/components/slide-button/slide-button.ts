import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-slide-button',
  templateUrl: './slide-button.html',
  styleUrl: './slide-button.scss'
})
export class SlideButton implements AfterViewInit {
  @ViewChild('leftBtn') leftBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('rightBtn') rightBtn?: ElementRef<HTMLButtonElement>;

  @Input() labelLeft: string = 'Option 1';
  @Input() labelRight: string = 'Option 2';
  @Input() selectedLabel: string = 'Option 1';

  @Output() selectedLabelChange = new EventEmitter<string>();

  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  handleSelectedLabel(label: string) {
    this.selectedLabel = label;
    this.selectedLabelChange.emit(this.selectedLabel);

  }

  getButtonWidth(button: HTMLButtonElement): number {
    return button.getClientRects()[0].width;
  }
}
