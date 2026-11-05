package mii.authoring.controls
{
   import com.senocular.ui.VirtualMouse;
   
   public class EditorMouse
   {
      
      private static var _instance:VirtualMouse;
      
      public function EditorMouse()
      {
         super();
      }
      
      public static function getInstance() : VirtualMouse
      {
         if(!_instance)
         {
            _instance = new VirtualMouse();
         }
         return _instance;
      }
   }
}

