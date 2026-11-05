package mii.authoring.dialogs
{
   import flash.display.MovieClip;
   import flash.events.MouseEvent;
   import flash.text.TextField;
   
   [Embed(source="/_assets/assets.swf", symbol="symbol276")]
   public class Alert extends MovieClip
   {
      
      public var label:TextField;
      
      public var okButton:MovieClip;
      
      public function Alert(param1:String = "")
      {
         super();
         if(param1)
         {
            this.message = param1;
         }
         okButton.addEventListener(MouseEvent.CLICK,clickOk);
      }
      
      public function get message() : String
      {
         return label.text;
      }
      
      public function set message(param1:String) : void
      {
         label.text = param1;
      }
      
      private function clickOk(param1:MouseEvent) : void
      {
         if(parent)
         {
            parent.removeChild(this);
         }
      }
   }
}

