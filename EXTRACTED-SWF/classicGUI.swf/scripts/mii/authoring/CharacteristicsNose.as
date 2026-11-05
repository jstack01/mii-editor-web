package mii.authoring
{
   public class CharacteristicsNose extends AbstractGUIPage
   {
      
      public function CharacteristicsNose(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 12;
         currPage = 0;
         currProp = "nose";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.assignOptionListeners(["Y","Size"]);
         target.drawPage();
         target.updateURLText();
      }
   }
}

