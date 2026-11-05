package mii.authoring
{
   public class CharacteristicsFacialFeatures extends AbstractGUIPage
   {
      
      public function CharacteristicsFacialFeatures(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 12;
         currPage = 0;
         currProp = "facialFeatures";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.setupColors("skin");
         target.drawPage();
         target.updateURLText();
      }
   }
}

