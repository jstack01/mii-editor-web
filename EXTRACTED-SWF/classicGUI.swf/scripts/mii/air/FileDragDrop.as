package mii.air
{
   import flash.desktop.DragActions;
   import flash.desktop.DragManager;
   import flash.desktop.TransferableFormats;
   import flash.display.DisplayObject;
   import flash.events.NativeDragEvent;
   import flash.filesystem.File;
   
   public class FileDragDrop
   {
      
      private var target:DisplayObject;
      
      private var loader:AirLoad;
      
      public function FileDragDrop(param1:DisplayObject, param2:AirLoad)
      {
         super();
         this.target = param1;
         this.loader = param2;
         param1.addEventListener(NativeDragEvent.NATIVE_DRAG_ENTER,dragEnter);
         param1.addEventListener(NativeDragEvent.NATIVE_DRAG_DROP,dragDrop);
      }
      
      private function dragEnter(param1:NativeDragEvent) : void
      {
         DragManager.acceptDragDrop(target);
      }
      
      private function dragDrop(param1:NativeDragEvent) : void
      {
         var _loc2_:Array = null;
         DragManager.dropAction = DragActions.COPY;
         _loc2_ = param1.transferable.dataForFormat(TransferableFormats.FILE_LIST_FORMAT) as Array;
         loader.openFile(File(_loc2_[0]));
      }
      
      public function clear() : void
      {
         target.removeEventListener(NativeDragEvent.NATIVE_DRAG_ENTER,dragEnter);
         target.removeEventListener(NativeDragEvent.NATIVE_DRAG_DROP,dragDrop);
      }
   }
}

