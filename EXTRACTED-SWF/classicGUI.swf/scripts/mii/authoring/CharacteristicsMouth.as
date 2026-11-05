package mii.authoring
{
   public class CharacteristicsMouth extends AbstractGUIPage
   {
      
      public function CharacteristicsMouth(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 2;
         itemCount = 12;
         currPage = 0;
         currProp = "mouth";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignPageListeners();
         target.setupColors("mouth");
         target.assignOptionListeners(["Y","Size"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

