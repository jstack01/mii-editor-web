package mii.authoring
{
   public class CharacteristicsBeard extends AbstractGUIPage
   {
      
      public function CharacteristicsBeard(param1:ClassicGUI)
      {
         super(param1);
         pageCount = 1;
         itemCount = 4;
         currPage = 0;
         currProp = "beard";
      }
      
      override public function updateGUI() : void
      {
         super.updateGUI();
         target.assignItemListeners();
         target.setupColors("facialHair");
         target.drawPage();
         target.updateURLText();
      }
   }
}

